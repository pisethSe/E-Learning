# GradeA User Frontend

GradeA is a bilingual e-learning frontend built for secondary school students, with a strong focus on learners in Grades 9 to 12. The platform presents educational content in both Khmer and English and is designed to make studying feel more accessible, flexible, and engaging.

This frontend highlights audio-based learning, subject discovery, and guided study steps through a modern landing page experience. It combines clear typography, animated content, textbook showcases, and an interactive learning-steps section to communicate how the platform helps students study anytime and anywhere.

## Features

- Bilingual interface with Khmer and English content
- Grade 9 to Grade 12 learning focus
- Audio-learning oriented messaging and student-friendly presentation
- Interactive hero section with rotating educational quotes
- Animated textbook slider for featured study materials
- Visual learning steps section with autoplay image transitions
- Responsive navigation for desktop and mobile screens

## Subjects Covered

- Khmer Literature
- Mathematics
- History
- Geography
- Chemistry
- Biology
- Earth Science
- Ethics and Civics

## Tech Stack

- React
- Vite
- Tailwind CSS
- Framer Motion
- Lucide React
- Radix UI

## Project Structure

```text
user-frontend/
├── public/
│   ├── book-covers/
│   └── learning-steps/
├── src/
│   ├── components/
│   │   └── layout/
│   ├── App.jsx
│   └── index.css
├── package.json
└── README.md
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the development server

```bash
npm run dev
```

### 3. Build for production

```bash
npm run build
```

### 4. Preview the production build

```bash
npm run preview
```

## Main UI Sections

### Navbar

The navigation bar provides quick access to the main sections of the site, along with language switching and dark mode controls.

### Hero Section

The hero area introduces the platform with bilingual messaging, animated quotes, learner statistics, subject highlights, and a flowing textbook showcase.

### Learning Steps

The vertical tabs section explains how GradeA helps students learn more effectively through a sequence of visual study benefits such as saving time, learning anywhere, studying smarter, improving skills, and getting results.

## Assets

Some sections depend on static assets placed in the `public` folder, including:

- `public/book-covers/` for textbook cover images
- `public/learning-steps/` for the step-based learning visuals

## Purpose

The goal of GradeA is to create a clean and motivating digital learning experience for Cambodian students by blending educational content, modern design, and accessible bilingual presentation into one platform.
