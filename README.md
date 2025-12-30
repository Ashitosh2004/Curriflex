# Curriflex - Smart Schedule Genie

**Automated College Timetable Management System**

A modern, intelligent web application for generating conflict-free academic timetables for colleges and universities with minimal user input.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🎯 Features

### Core Functionality
- **Automated Timetable Generation** - Intelligent algorithm generates conflict-free schedules
- **Conflict Detection** - Real-time detection and resolution of scheduling conflicts
- **Multi-Department Support** - Manage multiple departments, years, and semesters
- **Subject Allocation** - Assign subjects to faculty with department and year filtering
- **Room Management** - Track and allocate classrooms and labs efficiently

### Advanced Features
- **Time Configuration** - Customize lecture durations, breaks, and working hours
- **Export Options** - Download timetables as PDF or Excel
- **Dark Mode** - Beautiful dark/light theme support
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Real-time Updates** - Firebase Firestore integration for instant data sync

### Data Management
- **Departments** - Create and manage academic departments with unique codes
- **Faculty** - Maintain faculty profiles with specializations
- **Subjects** - Define subjects with types (Theory/Lab/Practical) and weekly hours
- **Rooms** - Track available classrooms and laboratories
- **Students** - Manage student records with department filtering

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Firebase account (for database)
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Ashitosh2004/Curriflex.git
cd Curriflex
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure Firebase**
   - The `.env.local` file is already included with Firebase configuration
   - Or create your own Firebase project and update the credentials

4. **Run development server**
```bash
npm run dev
```

5. **Open in browser**
   - Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## 📋 Usage Guide

### Initial Setup

1. **Configure Time Settings**
   - Go to Settings → Time Configuration
   - Set lecture duration, lab duration, breaks, and working hours
   - Select working days (Monday-Friday recommended)

2. **Add Departments**
   - Navigate to Departments page
   - Add your academic departments with unique codes

3. **Add Faculty Members**
   - Go to Faculty page
   - Add faculty with their details and specializations

4. **Add Subjects**
   - Navigate to Subjects page
   - Create subjects with type (Theory/Lab/Practical) and weekly hours

5. **Add Rooms**
   - Go to Rooms page
   - Add classrooms and labs with capacity

### Generating Timetables

1. **Allocate Subjects**
   - Go to Subject Allocation page
   - Assign subjects to faculty for specific departments and years

2. **Generate Timetable**
   - Navigate to Timetable page
   - Select department and year
   - Click "Generate" button
   - Review the generated timetable

3. **Save and Export**
   - Click "Save to Firebase" to store the timetable
   - Export as PDF or Excel for distribution

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives

### Backend & Database
- **Firebase Firestore** - NoSQL cloud database
- **Firebase SDK** - Real-time data synchronization

### Libraries
- **React Router** - Client-side routing
- **jsPDF** - PDF generation
- **xlsx** - Excel export
- **Lucide React** - Icon library
- **date-fns** - Date utilities

## 📁 Project Structure

```
Curriflex/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # Base UI components (Button, Card, etc.)
│   │   ├── Layout.tsx    # Main layout wrapper
│   │   ├── Sidebar.tsx   # Navigation sidebar
│   │   └── TimetableGrid.tsx
│   ├── contexts/         # React contexts
│   │   └── AppContext.tsx
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   ├── pages/            # Page components
│   │   ├── DashboardPage.tsx
│   │   ├── DepartmentsPage.tsx
│   │   ├── FacultyPage.tsx
│   │   ├── SubjectsPage.tsx
│   │   ├── RoomsPage.tsx
│   │   ├── StudentsPage.tsx
│   │   ├── SubjectAllocationPage.tsx
│   │   ├── TimetablePage.tsx
│   │   ├── TimeConfigPage.tsx
│   │   └── SettingsPage.tsx
│   ├── services/         # Firebase services
│   │   └── firebaseService.ts
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/            # Utility functions
│   │   └── timetableGenerator.ts
│   ├── App.tsx           # Root component
│   └── main.tsx          # Entry point
├── public/               # Static assets
├── .env.local           # Environment variables (Firebase config)
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
├── vite.config.ts       # Vite configuration
└── tailwind.config.js   # Tailwind CSS config
```

## 🔧 Configuration

### Environment Variables

The `.env.local` file contains Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Firestore Database
3. Copy your Firebase config to `.env.local`
4. Set up Firestore security rules (optional)

## 🎨 Customization

### Theme Colors
Edit `tailwind.config.js` to customize colors:

```javascript
theme: {
  extend: {
    colors: {
      primary: {...},
      secondary: {...},
    }
  }
}
```

### Time Configuration
Adjust default time settings in `TimeConfigPage.tsx`

## 📝 Algorithm Details

### Timetable Generation
The system uses an intelligent round-robin algorithm that:
1. Distributes subjects evenly across all working days
2. Avoids faculty conflicts (same faculty, different classes)
3. Prevents room double-booking
4. Respects time slot constraints
5. Handles lab sessions requiring consecutive slots

### Conflict Detection
Real-time conflict detection checks for:
- Faculty availability conflicts
- Room booking conflicts
- Time slot overlaps
- Subject allocation mismatches

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Ashitosh Pandey**
- GitHub: [@Ashitosh2004](https://github.com/Ashitosh2004)

## 🙏 Acknowledgments

- Built with modern web technologies
- Designed for educational institutions
- Focused on user experience and automation

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact: ashitoshpandey2004@gmail.com

---

**Made with ❤️ for educational institutions**
