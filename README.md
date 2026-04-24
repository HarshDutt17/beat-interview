# Beat Interview - Spaced Repetition Learning Platform

[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple.svg)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern, interactive spaced repetition learning platform designed to help developers master Data Structures & Algorithms (DSA) and System Design concepts through scientifically-proven memory techniques.

## 🌟 Features

### 🧠 **BeatCode - DSA Mastery**
- **250+ Curated Problems** from top coding platforms
- **Smart Scheduling** using SM-2 spaced repetition algorithm
- **Topic-wise Organization** (Arrays, Graphs, Dynamic Programming, etc.)
- **Difficulty Progression** (Easy → Medium → Hard)
- **Progress Tracking** with streaks and statistics
- **Custom Study Sessions** with flexible filtering

### 🏗️ **BeatDesign - System Design Excellence**
- **Comprehensive Concepts** (Scalability, Load Balancing, Databases)
- **Real-world Case Studies** and architecture patterns
- **Interactive Learning** with spaced repetition
- **Progressive Difficulty** from basics to advanced topics

## 🧮 Learning Algorithm - SM-2 Spaced Repetition

This platform implements the **SuperMemo SM-2 algorithm**, a scientifically-proven method for optimizing long-term retention:

### How It Works
1. **Initial Learning**: New cards appear frequently until mastered
2. **Interval Calculation**: Based on your performance (Failed, Solved, Easy)
3. **Adaptive Scheduling**: Cards reappear just before you're likely to forget
4. **Ease Factor**: Difficulty adjusts based on your historical performance

### Performance Ratings
- **Failed** (1.3x ease): Couldn't solve → Review soon
- **Solved** (2.5x ease): Standard progression → Normal interval
- **Easy** (2.6x ease): Too simple → Longer interval

### Interval Progression
```
Day 1 → Day 6 → Day 16 → Day 35 → Day 80 → ...
```
*Intervals adapt based on your individual performance*

## 💾 Data Storage

### Client-Side Storage (localStorage)
All user data is stored locally in your browser using `localStorage`:

```javascript
// Storage Structure
{
  "beatcode_progress": {
    "problemProgress": {
      "problem-id": {
        "reps": 3,           // Number of successful reviews
        "ease": 2.5,         // Ease factor (1.3 - 2.6)
        "intervalDays": 16,  // Days until next review
        "lastReviewed": "2024-04-23",
        "nextDue": "2024-05-09"
      }
    },
    "totalReviews": 156,
    "studyStreak": 12,
    "lastStudyDate": "2024-04-23"
  },
  "beatdesign_progress": { /* Similar structure */ },
  "settings": {
    "cardsPerSession": 15,
    "theme": "system"
  }
}
```

### Privacy-First Design
- **No server storage** - your progress stays on your device
- **No tracking** - we don't collect any personal data
- **Export/Import** functionality for data portability (planned)

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/HarshDutt17/beat-interview.git
cd beat-interview
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Open your browser**
```
http://localhost:5173
```

### Build for Production
```bash
npm run build
npm run preview
```

## 🏗️ Project Structure

```
src/
├── apps/
│   ├── beatcode/          # DSA Problems Module
│   │   ├── components/    # Problem cards, UI components
│   │   ├── data/         # 250+ curated problems
│   │   ├── pages/        # Dashboard, Study, Browse
│   │   └── services/     # Progress tracking, SM-2 algorithm
│   │
│   └── beatdesign/       # System Design Module
│       ├── components/   # Concept cards, UI components
│       ├── data/        # System design concepts & studies
│       ├── pages/       # Dashboard, Study sessions
│       └── services/    # Progress & scheduling logic
│
├── shared/
│   ├── components/      # Reusable UI components
│   └── services/        # Shared utilities & storage
│
└── App.tsx             # Main router & app shell
```

## 🛠️ Technology Stack

- **Frontend**: React 18.3 + TypeScript
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS
- **Build Tool**: Vite 5.4
- **Icons**: Lucide React
- **Storage**: Browser localStorage
- **Deployment**: Vercel (optimized)

## 📈 Data Sources

### Problem Datasets
- **LeetCode**: Popular algorithm problems
- **System Design**: Real-world case studies
- **Curated Content**: Hand-picked for learning progression

### Content Categories
- **Arrays & Strings**: 95 problems
- **Linked Lists**: 45 problems
- **Trees & Graphs**: 128 problems
- **Dynamic Programming**: 87 problems
- **System Design**: 156 concepts
- **And more...**

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### 🐛 Reporting Issues
Found a bug or have a suggestion? [Open an issue](https://github.com/HarshDutt17/beat-interview/issues/new)

**Please include:**
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Browser and OS information

### 🔧 Contributing Code

1. **Fork the repository**
2. **Create a feature branch**
```bash
git checkout -b feature/amazing-feature
```

3. **Make your changes**
   - Follow existing code style
   - Add tests if applicable
   - Update documentation

4. **Commit your changes**
```bash
git commit -m "feat: add amazing feature"
```

5. **Push and create a Pull Request**
```bash
git push origin feature/amazing-feature
```

### 📝 Content Contributions
- **Add new problems** to the dataset
- **Improve problem descriptions** or explanations
- **Add system design case studies**
- **Translate content** (internationalization)

### � Reporting Broken Links
Found broken or outdated links in the content? Help us maintain quality resources!

**Please report broken links by:**
- [Opening an issue](https://github.com/HarshDutt17/beat-interview/issues/new) with the broken URL and suggested replacement
- Or submit a [pull request](https://github.com/HarshDutt17/beat-interview/pulls) with the fix

**Include in your report:**
- The broken URL and where you found it
- What the link should point to (if known)
- Any error messages or issues encountered

### �💡 Feature Ideas
- Export/import progress data
- Study reminders and notifications
- Social features (leaderboards, sharing)
- Mobile app version
- Additional learning modules

## 📊 Performance & Analytics

### Local Metrics Tracked
- Problems solved by difficulty
- Study streaks and consistency
- Topic-wise progress
- Time spent studying
- Retention rates per topic

### No External Analytics
This app respects your privacy - no data is sent to external services.

## 🔒 Privacy & Security

- **Local-first**: All data stays on your device
- **No tracking**: We don't collect analytics or personal information
- **No accounts required**: Start learning immediately
- **Open source**: Full transparency in code and data handling

## 📱 Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **SuperMemo** for the SM-2 spaced repetition algorithm
- **LeetCode** for inspiration and problem references
- **Open source community** for tools and libraries
- **Contributors** who help improve this project

## 🔗 Links

- **Live Demo**: [beat-interview.vercel.app](https://beat-interview.vercel.app/)
- **GitHub**: [github.com/HarshDutt17/beat-interview/](https://github.com/HarshDutt17/beat-interview/)
- **Issues**: [Report bugs or request features](https://github.com/HarshDutt17/beat-interview/issues)

---

**Happy Learning! 🎯**

Made with ❤️ for developers who want to ace their coding interviews and system design rounds.