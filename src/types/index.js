// Core entity types for Magazinify AI

/**
 * @typedef {'basic' | 'pro' | 'customize'} PlanType
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} name
 * @property {string} tenantId
 * @property {PlanType} plan
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {Object} Tenant
 * @property {string} id
 * @property {string} name
 * @property {string} subdomain
 * @property {string} [customDomain]
 * @property {PlanType} plan
 * @property {Object} settings
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {Object} Blueprint
 * @property {string} id
 * @property {string} tenantId
 * @property {string} name
 * @property {Object} brand - Brand configuration (logo, colors, fonts)
 * @property {string} brand.logoUrl
 * @property {Object} brand.colors
 * @property {string} brand.colors.primary
 * @property {string} brand.colors.secondary
 * @property {string} brand.colors.accent
 * @property {Object} brand.fonts
 * @property {string} brand.fonts.heading
 * @property {string} brand.fonts.body
 * @property {Object} voice - Voice and tone settings
 * @property {string} voice.tone
 * @property {string} voice.style
 * @property {string[]} voice.keywords
 * @property {Object[]} sections - Page sections configuration
 * @property {string} sections[].id
 * @property {string} sections[].name
 * @property {string} sections[].type
 * @property {number} sections[].order
 * @property {Object} sections[].settings
 * @property {number} defaultPageCount
 * @property {Object[]} adSlots - Advertisement slot configuration
 * @property {string} adSlots[].key
 * @property {number} adSlots[].page
 * @property {string} adSlots[].position
 * @property {Object} adSlots[].dimensions
 * @property {string[]} contentSources - RSS feeds and content sources
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {Object} Magazine
 * @property {string} id
 * @property {string} tenantId
 * @property {string} blueprintId
 * @property {string} title
 * @property {string} slug
 * @property {'draft' | 'review' | 'published'} status
 * @property {Date} issueDate
 * @property {number} pageCount
 * @property {Object[]} pages
 * @property {string} pages[].id
 * @property {number} pages[].number
 * @property {string} pages[].type
 * @property {Object} pages[].content
 * @property {Object} pages[].layout
 * @property {string} [publishedUrl]
 * @property {Object} analytics
 * @property {Date} createdAt
 * @property {Date} updatedAt
 * @property {Date} [publishedAt]
 */

/**
 * @typedef {Object} Article
 * @property {string} id
 * @property {string} magazineId
 * @property {string} title
 * @property {string} subtitle
 * @property {string} content
 * @property {string} summary
 * @property {string[]} pullQuotes
 * @property {string} [imageUrl]
 * @property {string} [imageAlt]
 * @property {string} author
 * @property {number} pageStart
 * @property {number} pageEnd
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {Object} AdSlot
 * @property {string} id
 * @property {string} tenantId
 * @property {string} key
 * @property {string} title
 * @property {string} [imageUrl]
 * @property {string} [linkUrl]
 * @property {string} [description]
 * @property {boolean} active
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {Object} Analytics
 * @property {string} id
 * @property {string} magazineId
 * @property {string} [pageId]
 * @property {'view' | 'page_turn' | 'cta_click' | 'ad_click'} eventType
 * @property {Object} metadata
 * @property {string} [userAgent]
 * @property {string} [ipAddress]
 * @property {Date} timestamp
 */

export {};
