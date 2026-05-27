import { StockInfo } from "@/types/stock";

export const STOCK_UNIVERSE: StockInfo[] = [
  // Technology
  { symbol: "AAPL", name: "Apple Inc.", sector: "Technology", industry: "Consumer Electronics", marketCap: 0 },
  { symbol: "MSFT", name: "Microsoft Corporation", sector: "Technology", industry: "Software—Infrastructure", marketCap: 0 },
  { symbol: "GOOGL", name: "Alphabet Inc.", sector: "Technology", industry: "Internet Content & Information", marketCap: 0 },
  { symbol: "AMZN", name: "Amazon.com Inc.", sector: "Technology", industry: "Internet Retail", marketCap: 0 },
  { symbol: "META", name: "Meta Platforms Inc.", sector: "Technology", industry: "Internet Content & Information", marketCap: 0 },
  { symbol: "NVDA", name: "NVIDIA Corporation", sector: "Technology", industry: "Semiconductors", marketCap: 0 },
  { symbol: "TSLA", name: "Tesla Inc.", sector: "Technology", industry: "Auto Manufacturers", marketCap: 0 },
  { symbol: "AVGO", name: "Broadcom Inc.", sector: "Technology", industry: "Semiconductors", marketCap: 0 },
  { symbol: "ORCL", name: "Oracle Corporation", sector: "Technology", industry: "Software—Infrastructure", marketCap: 0 },
  { symbol: "ADBE", name: "Adobe Inc.", sector: "Technology", industry: "Software—Infrastructure", marketCap: 0 },
  { symbol: "CRM", name: "Salesforce Inc.", sector: "Technology", industry: "Software—Application", marketCap: 0 },
  { symbol: "INTC", name: "Intel Corporation", sector: "Technology", industry: "Semiconductors", marketCap: 0 },
  { symbol: "AMD", name: "Advanced Micro Devices Inc.", sector: "Technology", industry: "Semiconductors", marketCap: 0 },
  { symbol: "CSCO", name: "Cisco Systems Inc.", sector: "Technology", industry: "Communication Equipment", marketCap: 0 },
  { symbol: "IBM", name: "International Business Machines", sector: "Technology", industry: "IT Services", marketCap: 0 },
  { symbol: "QCOM", name: "QUALCOMM Incorporated", sector: "Technology", industry: "Semiconductors", marketCap: 0 },
  { symbol: "TXN", name: "Texas Instruments Inc.", sector: "Technology", industry: "Semiconductors", marketCap: 0 },
  { symbol: "NOW", name: "ServiceNow Inc.", sector: "Technology", industry: "Software—Application", marketCap: 0 },
  { symbol: "UBER", name: "Uber Technologies Inc.", sector: "Technology", industry: "Software—Application", marketCap: 0 },
  { symbol: "NFLX", name: "Netflix Inc.", sector: "Technology", industry: "Entertainment", marketCap: 0 },
  { symbol: "SNOW", name: "Snowflake Inc.", sector: "Technology", industry: "Software—Application", marketCap: 0 },
  { symbol: "PLTR", name: "Palantir Technologies Inc.", sector: "Technology", industry: "Software—Infrastructure", marketCap: 0 },

  // Financial
  { symbol: "JPM", name: "JPMorgan Chase & Co.", sector: "Financial", industry: "Banks—Diversified", marketCap: 0 },
  { symbol: "V", name: "Visa Inc.", sector: "Financial", industry: "Credit Services", marketCap: 0 },
  { symbol: "MA", name: "Mastercard Incorporated", sector: "Financial", industry: "Credit Services", marketCap: 0 },
  { symbol: "BAC", name: "Bank of America Corporation", sector: "Financial", industry: "Banks—Diversified", marketCap: 0 },
  { symbol: "WFC", name: "Wells Fargo & Company", sector: "Financial", industry: "Banks—Diversified", marketCap: 0 },
  { symbol: "GS", name: "The Goldman Sachs Group Inc.", sector: "Financial", industry: "Capital Markets", marketCap: 0 },
  { symbol: "MS", name: "Morgan Stanley", sector: "Financial", industry: "Capital Markets", marketCap: 0 },
  { symbol: "C", name: "Citigroup Inc.", sector: "Financial", industry: "Banks—Diversified", marketCap: 0 },
  { symbol: "AXP", name: "American Express Company", sector: "Financial", industry: "Credit Services", marketCap: 0 },
  { symbol: "BLK", name: "BlackRock Inc.", sector: "Financial", industry: "Asset Management", marketCap: 0 },
  { symbol: "SCHW", name: "Charles Schwab Corporation", sector: "Financial", industry: "Capital Markets", marketCap: 0 },
  { symbol: "PYPL", name: "PayPal Holdings Inc.", sector: "Financial", industry: "Credit Services", marketCap: 0 },
  { symbol: "BRK.B", name: "Berkshire Hathaway Inc.", sector: "Financial", industry: "Insurance—Diversified", marketCap: 0 },

  // Healthcare
  { symbol: "JNJ", name: "Johnson & Johnson", sector: "Healthcare", industry: "Drug Manufacturers—General", marketCap: 0 },
  { symbol: "UNH", name: "UnitedHealth Group Inc.", sector: "Healthcare", industry: "Healthcare Plans", marketCap: 0 },
  { symbol: "PFE", name: "Pfizer Inc.", sector: "Healthcare", industry: "Drug Manufacturers—General", marketCap: 0 },
  { symbol: "MRK", name: "Merck & Co. Inc.", sector: "Healthcare", industry: "Drug Manufacturers—General", marketCap: 0 },
  { symbol: "ABBV", name: "AbbVie Inc.", sector: "Healthcare", industry: "Drug Manufacturers—General", marketCap: 0 },
  { symbol: "TMO", name: "Thermo Fisher Scientific Inc.", sector: "Healthcare", industry: "Diagnostics & Research", marketCap: 0 },
  { symbol: "LLY", name: "Eli Lilly and Company", sector: "Healthcare", industry: "Drug Manufacturers—General", marketCap: 0 },
  { symbol: "ABT", name: "Abbott Laboratories", sector: "Healthcare", industry: "Medical Devices", marketCap: 0 },
  { symbol: "MDT", name: "Medtronic plc", sector: "Healthcare", industry: "Medical Devices", marketCap: 0 },
  { symbol: "BMY", name: "Bristol-Myers Squibb Company", sector: "Healthcare", industry: "Drug Manufacturers—General", marketCap: 0 },
  { symbol: "AMGN", name: "Amgen Inc.", sector: "Healthcare", industry: "Drug Manufacturers—General", marketCap: 0 },
  { symbol: "GILD", name: "Gilead Sciences Inc.", sector: "Healthcare", industry: "Drug Manufacturers—General", marketCap: 0 },
  { symbol: "CVS", name: "CVS Health Corporation", sector: "Healthcare", industry: "Healthcare Plans", marketCap: 0 },

  // Consumer Cyclical
  { symbol: "HD", name: "The Home Depot Inc.", sector: "Consumer Cyclical", industry: "Home Improvement Retail", marketCap: 0 },
  { symbol: "MCD", name: "McDonald's Corporation", sector: "Consumer Cyclical", industry: "Restaurants", marketCap: 0 },
  { symbol: "NKE", name: "Nike Inc.", sector: "Consumer Cyclical", industry: "Footwear & Accessories", marketCap: 0 },
  { symbol: "DIS", name: "The Walt Disney Company", sector: "Consumer Cyclical", industry: "Entertainment", marketCap: 0 },
  { symbol: "SBUX", name: "Starbucks Corporation", sector: "Consumer Cyclical", industry: "Restaurants", marketCap: 0 },
  { symbol: "LOW", name: "Lowe's Companies Inc.", sector: "Consumer Cyclical", industry: "Home Improvement Retail", marketCap: 0 },
  { symbol: "TJX", name: "The TJX Companies Inc.", sector: "Consumer Cyclical", industry: "Apparel Retail", marketCap: 0 },
  { symbol: "BKNG", name: "Booking Holdings Inc.", sector: "Consumer Cyclical", industry: "Travel Services", marketCap: 0 },
  { symbol: "AMAT", name: "Applied Materials Inc.", sector: "Technology", industry: "Semiconductor Equipment & Materials", marketCap: 0 },
  { symbol: "ADI", name: "Analog Devices Inc.", sector: "Technology", industry: "Semiconductors", marketCap: 0 },

  // Energy
  { symbol: "XOM", name: "Exxon Mobil Corporation", sector: "Energy", industry: "Oil & Gas Integrated", marketCap: 0 },
  { symbol: "CVX", name: "Chevron Corporation", sector: "Energy", industry: "Oil & Gas Integrated", marketCap: 0 },
  { symbol: "COP", name: "ConocoPhillips", sector: "Energy", industry: "Oil & Gas E&P", marketCap: 0 },
  { symbol: "EOG", name: "EOG Resources Inc.", sector: "Energy", industry: "Oil & Gas E&P", marketCap: 0 },
  { symbol: "SLB", name: "Schlumberger Limited", sector: "Energy", industry: "Oil & Gas Equipment & Services", marketCap: 0 },
  { symbol: "OXY", name: "Occidental Petroleum Corporation", sector: "Energy", industry: "Oil & Gas E&P", marketCap: 0 },

  // Consumer Defensive
  { symbol: "PG", name: "The Procter & Gamble Company", sector: "Consumer Defensive", industry: "Household & Personal Products", marketCap: 0 },
  { symbol: "KO", name: "The Coca-Cola Company", sector: "Consumer Defensive", industry: "Beverages—Non-Alcoholic", marketCap: 0 },
  { symbol: "PEP", name: "PepsiCo Inc.", sector: "Consumer Defensive", industry: "Beverages—Non-Alcoholic", marketCap: 0 },
  { symbol: "WMT", name: "Walmart Inc.", sector: "Consumer Defensive", industry: "Discount Stores", marketCap: 0 },
  { symbol: "COST", name: "Costco Wholesale Corporation", sector: "Consumer Defensive", industry: "Discount Stores", marketCap: 0 },
  { symbol: "PM", name: "Philip Morris International Inc.", sector: "Consumer Defensive", industry: "Tobacco", marketCap: 0 },
  { symbol: "MO", name: "Altria Group Inc.", sector: "Consumer Defensive", industry: "Tobacco", marketCap: 0 },
  { symbol: "MDLZ", name: "Mondelez International Inc.", sector: "Consumer Defensive", industry: "Confectioners", marketCap: 0 },
  { symbol: "CL", name: "Colgate-Palmolive Company", sector: "Consumer Defensive", industry: "Household & Personal Products", marketCap: 0 },

  // Industrial
  { symbol: "CAT", name: "Caterpillar Inc.", sector: "Industrial", industry: "Farm & Heavy Construction Machinery", marketCap: 0 },
  { symbol: "GE", name: "General Electric Company", sector: "Industrial", industry: "Aerospace & Defense", marketCap: 0 },
  { symbol: "HON", name: "Honeywell International Inc.", sector: "Industrial", industry: "Conglomerates", marketCap: 0 },
  { symbol: "UPS", name: "United Parcel Service Inc.", sector: "Industrial", industry: "Integrated Freight & Logistics", marketCap: 0 },
  { symbol: "BA", name: "The Boeing Company", sector: "Industrial", industry: "Aerospace & Defense", marketCap: 0 },
  { symbol: "LMT", name: "Lockheed Martin Corporation", sector: "Industrial", industry: "Aerospace & Defense", marketCap: 0 },
  { symbol: "RTX", name: "RTX Corporation", sector: "Industrial", industry: "Aerospace & Defense", marketCap: 0 },
  { symbol: "MMM", name: "3M Company", sector: "Industrial", industry: "Conglomerates", marketCap: 0 },
  { symbol: "NOC", name: "Northrop Grumman Corporation", sector: "Industrial", industry: "Aerospace & Defense", marketCap: 0 },

  // Communication Services
  { symbol: "T", name: "AT&T Inc.", sector: "Communication Services", industry: "Telecom Services", marketCap: 0 },
  { symbol: "VZ", name: "Verizon Communications Inc.", sector: "Communication Services", industry: "Telecom Services", marketCap: 0 },
  { symbol: "CMCSA", name: "Comcast Corporation", sector: "Communication Services", industry: "Telecom Services", marketCap: 0 },
  { symbol: "TMUS", name: "T-Mobile US Inc.", sector: "Communication Services", industry: "Telecom Services", marketCap: 0 },
  { symbol: "CHTR", name: "Charter Communications Inc.", sector: "Communication Services", industry: "Telecom Services", marketCap: 0 },

  // Real Estate
  { symbol: "PLD", name: "Prologis Inc.", sector: "Real Estate", industry: "REIT—Industrial", marketCap: 0 },
  { symbol: "AMT", name: "American Tower Corporation", sector: "Real Estate", industry: "REIT—Specialty", marketCap: 0 },
  { symbol: "EQIX", name: "Equinix Inc.", sector: "Real Estate", industry: "REIT—Specialty", marketCap: 0 },

  // Utilities
  { symbol: "NEE", name: "NextEra Energy Inc.", sector: "Utilities", industry: "Utilities—Regulated Electric", marketCap: 0 },
  { symbol: "DUK", name: "Duke Energy Corporation", sector: "Utilities", industry: "Utilities—Regulated Electric", marketCap: 0 },
  { symbol: "SO", name: "The Southern Company", sector: "Utilities", industry: "Utilities—Regulated Electric", marketCap: 0 },

  // Basic Materials
  { symbol: "LIN", name: "Linde plc", sector: "Basic Materials", industry: "Specialty Chemicals", marketCap: 0 },
  { symbol: "SHW", name: "The Sherwin-Williams Company", sector: "Basic Materials", industry: "Specialty Chemicals", marketCap: 0 },
  { symbol: "FCX", name: "Freeport-McMoRan Inc.", sector: "Basic Materials", industry: "Copper", marketCap: 0 },

  // Additional notable tech
  { symbol: "MU", name: "Micron Technology Inc.", sector: "Technology", industry: "Semiconductors", marketCap: 0 },
  { symbol: "INTU", name: "Intuit Inc.", sector: "Technology", industry: "Software—Application", marketCap: 0 },
  { symbol: "SAP", name: "SAP SE", sector: "Technology", industry: "Software—Application", marketCap: 0 },
  { symbol: "PANW", name: "Palo Alto Networks Inc.", sector: "Technology", industry: "Software—Infrastructure", marketCap: 0 },
  { symbol: "MRVL", name: "Marvell Technology Inc.", sector: "Technology", industry: "Semiconductors", marketCap: 0 },
  { symbol: "SQ", name: "Block Inc.", sector: "Technology", industry: "Software—Infrastructure", marketCap: 0 },
  { symbol: "DASH", name: "DoorDash Inc.", sector: "Technology", industry: "Software—Application", marketCap: 0 },
  { symbol: "SNAP", name: "Snap Inc.", sector: "Technology", industry: "Internet Content & Information", marketCap: 0 },
  { symbol: "HOOD", name: "Robinhood Markets Inc.", sector: "Technology", industry: "Capital Markets", marketCap: 0 },
  { symbol: "COIN", name: "Coinbase Global Inc.", sector: "Financial", industry: "Capital Markets", marketCap: 0 },
];

export const SECTORS = [...new Set(STOCK_UNIVERSE.map((s) => s.sector))].sort();

export function getStockInfo(symbol: string): StockInfo | undefined {
  return STOCK_UNIVERSE.find(
    (s) => s.symbol.toLowerCase() === symbol.toLowerCase()
  );
}
