import { AIService } from './ai-service'
import { Crawl4AIWebScraper } from './crawl4ai-wrapper'

// Interfaces for Company Outreach
export interface CompanyLead {
  id: string
  name: string
  website: string
  industry: string
  country: string
  employeeCount?: string
  revenue?: string
  contactEmails: string[]
  contactPhones: string[]
  socialMedia: {
    linkedin?: string
    facebook?: string
    twitter?: string
  }
  jobPostings: number
  lastActive: Date
  aiScore: number // 0-100 lead quality
  targetFit: number // Romanian recruitment suitability
  outreachStatus: 'new' | 'contacted' | 'qualified' | 'declined'
  notes?: string
}

export interface OutreachResult {
  company: CompanyLead
  success: boolean
  contactMethod?: string
  response?: string
  followUpDate?: Date
}

export class CompanyOutreachService {
  private static instance: CompanyOutreachService
  private aiService: AIService
  private scraper: Crawl4AIWebScraper
  private agents: Map<string, CompanyDiscoveryAgent> = new Map()

  // European target industries for Romanian recruitment
  private targetIndustries = {
    denmark: ['agriculture', 'manufacturing', 'construction', 'forestry', 'logistics', 'hospitality'],
    germany: ['construction', 'manufacturing', 'engineering', 'logistics', 'healthcare', 'retail'],
    netherlands: ['greenhouse', 'technology', 'logistics', 'manufacturing', 'it', 'hospitality'],
    france: ['construction', 'manufacturing', 'healthcare', 'hospitality', 'logistics', 'transportation']
  }

  constructor() {
    this.aiService = AIService.getInstance()
    this.scraper = new Crawl4AIWebScraper()
    this.initializeAgents()
  }

  public static getInstance(): CompanyOutreachService {
    if (!CompanyOutreachService.instance) {
      CompanyOutreachService.instance = new CompanyOutreachService()
    }
    return CompanyOutreachService.instance
  }

  private initializeAgents() {
    // Denmark Agents
    this.agents.set('dk_agriculture', new DanishAgricultureAgent())
    this.agents.set('dk_manufacturing', new DanishManufacturingAgent())
    this.agents.set('dk_construction', new DanishConstructionAgent())

    // Germany Agents
    this.agents.set('de_construction', new GermanConstructionAgent())
    this.agents.set('de_manufacturing', new GermanManufacturingAgent())
    this.agents.set('de_engineering', new GermanEngineeringAgent())

    // Netherlands Agents
    this.agents.set('nl_greenhouse', new DutchGreenhouseAgent())
    this.agents.set('nl_technology', new DutchTechnologyAgent())
    this.agents.set('nl_logistics', new DutchLogisticsAgent())

    // France Agents
    this.agents.set('fr_construction', new FrenchConstructionAgent())
    this.agents.set('fr_healthcare', new FrenchHealthcareAgent())
    this.agents.set('fr_hospitality', new FrenchHospitalityAgent())
  }

  // Main lead generation method
  async generateLeads(
    countries: string[] = ['denmark', 'germany', 'netherlands', 'france'],
    minScore: number = 70
  ): Promise<CompanyLead[]> {
    const leads: CompanyLead[] = []

    for (const country of countries) {
      console.log(`🔍 Starting company discovery for ${country}...`)

      const countryIndustries = this.targetIndustries[country.toLowerCase() as keyof typeof this.targetIndustries]
      if (!countryIndustries) continue

      for (const industry of countryIndustries) {
        const agentKey = `${country.substring(0, 2).toLowerCase()}_${industry}`
        const agent = this.agents.get(agentKey)

        if (agent) {
          try {
            const industryLeads = await agent.discoverCompanies()
            const qualifiedLeads = await this.qualifyLeads(industryLeads, minScore)
            leads.push(...qualifiedLeads)

            console.log(`✅ Found ${qualifiedLeads.length} qualified leads in ${country} ${industry}`)
          } catch (error) {
            console.error(`❌ Error in ${country} ${industry}:`, error)
          }
        }
      }
    }

    return leads
  }

  // Lead qualification using AI
  async qualifyLeads(leads: CompanyLead[], minScore: number): Promise<CompanyLead[]> {
    const qualifiedLeads: CompanyLead[] = []

    for (const lead of leads) {
      try {
        // AI-powered lead scoring
        const aiScore = await this.aiService.scoreLead(lead.id)
        const targetFit = await this.calculateRomanianRecruitmentFit(lead)

        lead.aiScore = aiScore.overallFit
        lead.targetFit = targetFit

        if (aiScore.overallFit >= minScore && targetFit >= minScore) {
          lead.outreachStatus = 'qualified'
          qualifiedLeads.push(lead)
        }
      } catch (error) {
        console.error(`Error qualifying lead ${lead.name}:`, error)
        // Keep leads with lower scores as they might be useful
        if (lead.aiScore >= (minScore - 20)) {
          lead.outreachStatus = 'new'
          qualifiedLeads.push(lead)
        }
      }
    }

    return qualifiedLeads
  }

  // Automated outreach execution
  async executeOutreach(campaignId: string, leads: CompanyLead[]): Promise<OutreachResult[]> {
    const results: OutreachResult[] = []

    console.log(`🚀 Starting outreach campaign ${campaignId} with ${leads.length} companies`)

    for (const lead of leads) {
      try {
        const result = await this.contactCompany(lead)
        results.push(result)

        // Update lead status based on result
        lead.outreachStatus = result.success ? 'contacted' : 'declined'
        lead.notes = result.response

        console.log(`📞 Contacted ${lead.name}: ${result.success ? '✅ Success' : '❌ No response'}`)

        // Rate limiting to avoid spam
        await new Promise(resolve => setTimeout(resolve, 2000))

      } catch (error) {
        console.error(`Outreach failed for ${lead.name}:`, error)
        results.push({
          company: lead,
          success: false,
          response: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        })
      }
    }

    return results
  }

  // Contact company via email/phone/website
  private async contactCompany(lead: CompanyLead): Promise<OutreachResult> {
    // Try email first
    if (lead.contactEmails.length > 0) {
      const emailResult = await this.sendOutreachEmail(lead, lead.contactEmails[0])
      return {
        company: lead,
        success: emailResult.success,
        contactMethod: 'email',
        response: emailResult.message,
        followUpDate: emailResult.success ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : undefined
      }
    }

    // Try LinkedIn outreach
    if (lead.socialMedia.linkedin) {
      const linkedinResult = await this.sendLinkedInMessage(lead)
      return {
        company: lead,
        success: linkedinResult.success,
        contactMethod: 'linkedin',
        response: linkedinResult.message,
        followUpDate: linkedinResult.success ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) : undefined
      }
    }

    // Phone outreach as last resort
    if (lead.contactPhones.length > 0) {
      const phoneResult = await this.makeOutreachCall(lead, lead.contactPhones[0])
      return {
        company: lead,
        success: phoneResult.success,
        contactMethod: 'phone',
        response: phoneResult.message,
        followUpDate: phoneResult.success ? new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) : undefined
      }
    }

    return {
      company: lead,
      success: false,
      response: 'No viable contact method found'
    }
  }

  // Email outreach automation
  private async sendOutreachEmail(lead: CompanyLead, email: string): Promise<{success: boolean, message: string}> {
    try {
      // Generate personalized email using AI
      const emailTemplate = await this.generatePersonalizedEmail(lead)

      console.log(`📧 Sending email to ${email} at ${lead.name}`)
      // Here we would integrate with email service (SendGrid, Mailgun, etc.)

      return {
        success: true,
        message: `Email sent to ${email}. ${emailTemplate.subject}`
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return {
        success: false,
        message: `Email failed: ${errorMessage}`
      }
    }
  }

  // LinkedIn outreach
  private async sendLinkedInMessage(lead: CompanyLead): Promise<{success: boolean, message: string}> {
    try {
      console.log(`💼 Sending LinkedIn message to ${lead.name}`)
      // Here we would integrate with LinkedIn API

      return {
        success: true,
        message: `LinkedIn message sent to ${lead.socialMedia.linkedin}`
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return {
        success: false,
        message: `LinkedIn outreach failed: ${errorMessage}`
      }
    }
  }

  // Phone outreach (automated voice)
  private async makeOutreachCall(lead: CompanyLead, phone: string): Promise<{success: boolean, message: string}> {
    try {
      console.log(`📞 Making outreach call to ${lead.name} at ${phone}`)
      // Here we would integrate with Twilio or similar service

      return {
        success: true,
        message: `Automated call made to ${phone}`
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return {
        success: false,
        message: `Call failed: ${errorMessage}`
      }
    }
  }

  // AI-generated personalized emails
  private async generatePersonalizedEmail(lead: CompanyLead): Promise<{subject: string, body: string}> {
    const prompt = `
    Generate a personalized outreach email for a Romanian recruitment agency contacting a European company.
    Company: ${lead.name}
    Industry: ${lead.industry}
    Country: ${lead.country}
    Employee Count: ${lead.employeeCount || 'Unknown'}
    Job Postings: ${lead.jobPostings}

    The email should:
    - Be professional and concise (under 200 words)
    - Highlight our expertise in Romanian talent recruitment
    - Mention their industry and show understanding
    - Focus on quality employment solutions
    - Include a clear call to action
    - Have an attention-grabbing subject line
    - Be written in English

    Format as JSON:
    {
      "subject": "Subject line here",
      "body": "Full email body here"
    }
    `

    try {
      const response = await this.aiService.generateResponse(prompt)
      if (response.success) {
        const emailData = JSON.parse(response.content)
        return {
          subject: emailData.subject || `Quality Romanian Talent for ${lead.name}`,
          body: emailData.body || 'Default email content...'
        }
      }
    } catch (error) {
      console.error('Email generation error:', error)
    }

    return {
      subject: `Romanian Recruitment Solutions for ${lead.name}`,
      body: `Dear Hiring Manager at ${lead.name},

      I'm reaching out from PIATA-AI.RO, Europe's leading AI-powered recruitment agency specializing in connecting Romanian talent with European companies.

      I noticed ${lead.name} is actively hiring in ${lead.industry}. Our platform has successfully placed Romanian professionals in similar companies across Europe, with a 95% placement rate.

      We can help you access qualified candidates who are ready to relocate and contribute immediately to your team.

      Would you be interested in discussing how we can streamline your hiring process?

      Best regards,
      Ionut Baltag
      CEO, PIATA-AI.RO
      +40721561784`
    }
  }

  // Calculate Romanian recruitment suitability
  private async calculateRomanianRecruitmentFit(lead: CompanyLead): Promise<number> {
    let score = 50 // Base score

    // Industry bonus
    const recruitmentFriendlyIndustries = ['construction', 'manufacturing', 'agriculture', 'logistics', 'hospitality', 'healthcare']
    if (recruitmentFriendlyIndustries.includes(lead.industry.toLowerCase())) {
      score += 25
    }

    // Job postings activity bonus
    if (lead.jobPostings > 5) score += 10
    else if (lead.jobPostings > 2) score += 5

    // Contact information completeness bonus
    if (lead.contactEmails.length > 0 && lead.contactPhones.length > 0) score += 10
    else if (lead.contactEmails.length > 0 || lead.contactPhones.length > 0) score += 5

    return Math.min(100, score)
  }
}



// Base Company Discovery Agent
abstract class CompanyDiscoveryAgent {
  protected scraper: Crawl4AIWebScraper
  protected aiService: AIService

  constructor() {
    this.scraper = new Crawl4AIWebScraper()
    this.aiService = AIService.getInstance()
  }

  abstract getSearchQueries(): string[]
  abstract getIndustry(): string
  abstract getCountry(): string

  async discoverCompanies(): Promise<CompanyLead[]> {
    const companies: CompanyLead[] = []

    for (const query of this.getSearchQueries()) {
      try {
        const searchResults = await this.searchCompanies(query)
        const companyLeads = await this.processSearchResults(searchResults)
        companies.push(...companyLeads)

        await new Promise(resolve => setTimeout(resolve, 1000)) // Rate limiting
      } catch (error) {
        console.error(`Error searching for ${query}:`, error)
      }
    }

    return companies
  }

  private async searchCompanies(query: string): Promise<any[]> {
    // This would integrate with search engines or business directories
    // For now, using mock data structure
    return [
      {
        name: `${query.replace(' companies', '').replace(' recruiters', '')} Ltd`,
        website: `https://www.${query.toLowerCase().replace(/\s+/g, '')}.com`,
        industry: this.getIndustry(),
        country: this.getCountry()
      }
    ]
  }

  private async processSearchResults(results: any[]): Promise<CompanyLead[]> {
    const leads: CompanyLead[] = []

    for (const result of results) {
      try {
        // Scrape company website for detailed info
        const websiteData = await this.scraper.scrapeUrl(result.website)

        if (websiteData) {
          const contactInfo = await this.scraper.extractContactInfo(websiteData.content || '')

          const lead: CompanyLead = {
            id: `${this.getCountry()}_${this.getIndustry()}_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            name: result.name,
            website: result.website,
            industry: this.getIndustry(),
            country: this.getCountry(),
            employeeCount: '50-200', // Mock data
            revenue: '€5M-€20M', // Mock data
            contactEmails: contactInfo.emails,
            contactPhones: contactInfo.phones,
            socialMedia: {
              linkedin: contactInfo.linkedin[0],
              facebook: undefined,
              twitter: undefined
            },
            jobPostings: Math.floor(Math.random() * 10) + 1,
            lastActive: new Date(),
            aiScore: 0, // Will be calculated later
            targetFit: 0, // Will be calculated later
            outreachStatus: 'new'
          }

          leads.push(lead)
        }
      } catch (error) {
        console.error(`Error processing ${result.name}:`, error)
      }
    }

    return leads
  }
}

// Concrete Agent Implementations

class DanishAgricultureAgent extends CompanyDiscoveryAgent {
  getSearchQueries(): string[] {
    return [
      'danish poultry farming companies',
      'danish crop farming businesses',
      'danish agricultural cooperatives',
      'danish greenhouse companies'
    ]
  }
  getIndustry(): string { return 'agriculture' }
  getCountry(): string { return 'denmark' }
}

class DanishManufacturingAgent extends CompanyDiscoveryAgent {
  getSearchQueries(): string[] {
    return [
      'danish manufacturing companies',
      'danish production facilities',
      'danish industrial businesses'
    ]
  }
  getIndustry(): string { return 'manufacturing' }
  getCountry(): string { return 'denmark' }
}

class DanishConstructionAgent extends CompanyDiscoveryAgent {
  getSearchQueries(): string[] {
    return [
      'danish construction companies',
      'danish building contractors',
      'danish civil engineering firms'
    ]
  }
  getIndustry(): string { return 'construction' }
  getCountry(): string { return 'denmark' }
}

class GermanConstructionAgent extends CompanyDiscoveryAgent {
  getSearchQueries(): string[] {
    return [
      'german construction companies',
      'german baufirmen',
      'german building contractors germany'
    ]
  }
  getIndustry(): string { return 'construction' }
  getCountry(): string { return 'germany' }
}

class GermanManufacturingAgent extends CompanyDiscoveryAgent {
  getSearchQueries(): string[] {
    return [
      'german manufacturing companies',
      'german produzenten',
      'german industrial firms'
    ]
  }
  getIndustry(): string { return 'manufacturing' }
  getCountry(): string { return 'germany' }
}

class GermanEngineeringAgent extends CompanyDiscoveryAgent {
  getSearchQueries(): string[] {
    return [
      'german engineering companies',
      'german ingenieurbüros',
      'german technical firms'
    ]
  }
  getIndustry(): string { return 'engineering' }
  getCountry(): string { return 'germany' }
}

class DutchGreenhouseAgent extends CompanyDiscoveryAgent {
  getSearchQueries(): string[] {
    return [
      'dutch greenhouse companies',
      'netherlands horticulture firms',
      'dutch agricultural technology'
    ]
  }
  getIndustry(): string { return 'greenhouse' }
  getCountry(): string { return 'netherlands' }
}

class DutchTechnologyAgent extends CompanyDiscoveryAgent {
  getSearchQueries(): string[] {
    return [
      'dutch technology companies',
      'netherlands software firms',
      'dutch IT bedrijven'
    ]
  }
  getIndustry(): string { return 'technology' }
  getCountry(): string { return 'netherlands' }
}

class DutchLogisticsAgent extends CompanyDiscoveryAgent {
  getSearchQueries(): string[] {
    return [
      'dutch logistics companies',
      'netherlands transport firms',
      'dutch warehouse bedrijven'
    ]
  }
  getIndustry(): string { return 'logistics' }
  getCountry(): string { return 'netherlands' }
}

class FrenchConstructionAgent extends CompanyDiscoveryAgent {
  getSearchQueries(): string[] {
    return [
      'french construction companies',
      'france building contractors',
      'french civil engineering'
    ]
  }
  getIndustry(): string { return 'construction' }
  getCountry(): string { return 'france' }
}

class FrenchHealthcareAgent extends CompanyDiscoveryAgent {
  getSearchQueries(): string[] {
    return [
      'french healthcare companies',
      'france medical facilities',
      'french nursing homes'
    ]
  }
  getIndustry(): string { return 'healthcare' }
  getCountry(): string { return 'france' }
}

class FrenchHospitalityAgent extends CompanyDiscoveryAgent {
  getSearchQueries(): string[] {
    return [
      'french hospitality companies',
      'france hotel chains',
      'french restaurant groups'
    ]
  }
  getIndustry(): string { return 'hospitality' }
  getCountry(): string { return 'france' }
}

export default CompanyOutreachService
