# Data Alchemist 🧪

Transform your spreadsheet data with AI-powered validation, intelligent error detection, and seamless export capabilities.

## 🌟 Features

### 📊 Smart Data Ingestion
- **Multi-format Support**: Upload CSV and XLSX files
- **AI-Powered Header Mapping**: Automatically maps misnamed or shuffled columns
- **Real-time Preview**: See your data as it's processed

### 🔍 Advanced Validation Engine
- **12 Comprehensive Validators**:
  1. Missing columns detection
  2. Duplicate ID identification
  3. Malformed list validation
  4. Out-of-range value checking
  5. Broken JSON detection
  6. Unknown reference validation
  7. Circular co-run group detection
  8. Conflicting schedule rule identification
  9. Overloaded worker detection
  10. Phase-slot capacity validation
  11. Skill coverage gap analysis
  12. Max concurrency feasibility checks

### 🤖 AI-Powered Features
- **Anomaly Detection**: Machine learning algorithms identify data outliers and patterns
- **Natural Language Rule Creation**: Describe rules in plain English, AI converts to structured format
- **Smart Suggestions**: Get AI-powered recommendations for data fixes

### ⚙️ Rules Configuration
- **Visual Rule Builder**: Create complex business rules with an intuitive interface
- **AI Rule Assistant**: Convert natural language descriptions to structured rules
- **Priority Weight Management**: Configure importance weights with multiple input methods

### 📈 Data Management
- **Interactive Data Grid**: Edit data inline with validation feedback
- **Real-time Error Highlighting**: See issues as they occur
- **Export Options**: Clean CSV/XLSX files plus configuration JSON

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/data-alchemist.git
cd data-alchemist
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
data-alchemist/
├── app/                    # Next.js app directory
│   ├── ingest/            # Data ingestion page
│   ├── rules/             # Rules configuration page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Shadcn/ui components
│   ├── data-grid.tsx     # Interactive data table
│   ├── header-mapper.tsx # AI header mapping
│   ├── validation-panel.tsx # Validation results
│   ├── rule-builder.tsx  # Rule creation interface
│   ├── ai-rule-assistant.tsx # Natural language rules
│   ├── anomaly-detection.tsx # AI anomaly detection
│   └── advanced-validators.tsx # Comprehensive validation
├── samples/              # Sample data files
│   ├── clients.csv
│   ├── workers.csv
│   └── tasks.csv
└── lib/                  # Utility functions
```

## 🎯 Supported Data Entities

### Clients
- **ClientID**: Unique identifier
- **ClientName**: Client organization name
- **PriorityLevel**: Priority ranking (1-5)
- **RequestedTaskIDs**: Comma-separated task references
- **GroupTag**: Client categorization
- **AttributesJSON**: Additional metadata in JSON format

### Workers
- **WorkerID**: Unique identifier
- **WorkerName**: Worker full name
- **Skills**: Comma-separated skill list
- **AvailableSlots**: Array of available time phases
- **MaxLoadPerPhase**: Maximum concurrent tasks
- **WorkerGroup**: Team or department assignment
- **QualificationLevel**: Experience level

### Tasks
- **TaskID**: Unique identifier
- **TaskName**: Task description
- **Category**: Task classification
- **Duration**: Number of phases required
- **RequiredSkills**: Comma-separated skill requirements
- **PreferredPhases**: Preferred execution timeframe
- **MaxConcurrent**: Maximum parallel instances

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file in the root directory:

```env
# Add any required environment variables here
NEXT_PUBLIC_APP_NAME=Data Alchemist
```

### Validation Rules
The system supports various rule types:
- **Co-run Groups**: Tasks that must execute together
- **Slot Restrictions**: Time-based constraints
- **Load Limits**: Worker capacity constraints
- **Phase Windows**: Execution time boundaries
- **Pattern Matches**: Data pattern requirements
- **Precedence Overrides**: Priority adjustments

## 📊 Sample Data

The `/samples` directory contains example data files that demonstrate the expected format for each entity type. Use these as templates for your own data.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/) and [TypeScript](https://www.typescriptlang.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide React](https://lucide.dev/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)

## 📞 Support

For support, email support@data-alchemist.com or create an issue in this repository.

---

**Data Alchemist** - Transform your data with the power of AI ✨