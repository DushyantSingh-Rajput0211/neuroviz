# NeuroViz - Neural Signal Visualization & Analysis Platform

A production-ready, multi-service platform for EEG/BCI data visualization, real-time streaming, preprocessing, and AI-powered classification. Built with modern technologies and optimized for neurotechnology applications.

## 🧠 Features

- **Real-time EEG Streaming**: Live visualization of multi-channel neural signals
- **Advanced Preprocessing**: Band-pass filtering, notch filtering, artifact rejection
- **Analytics Dashboard**: PSD analysis, band power calculations, channel statistics
- **AI Classification**: Lightweight CNN/LSTM models for intent classification
- **Secure Authentication**: JWT-based auth with bcrypt password hashing
- **Modern UI**: Responsive design with dark mode, built with React + Tailwind CSS

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Processing    │
│   React + Vite  │◄──►│   Spring Boot   │◄──►│   FastAPI       │
│   TypeScript    │    │   Java 17       │    │   Python 3.11   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   PostgreSQL    │
                    │   Database      │
                    └─────────────────┘
```

## 🚀 Quick Start

```bash
# Clone and setup
git clone <your-repo-url>
cd neuroviz

# Configure environment
cp .env.example .env

# Start all services
make up

# Seed demo data
make seed

# Open application
open http://localhost
```

**Demo Credentials:**
- Email: `demo@neuroviz.ai`
- Password: `Demo@123`

## 📱 Screenshots

*Login Page*
![Login](docs/screenshots/login.png)

*Sessions Dashboard*
![Sessions](docs/screenshots/sessions.png)

*Real-time Signal Viewer*
![Live Viewer](docs/screenshots/live-viewer.png)

*Analytics Dashboard*
![Analytics](docs/screenshots/analytics.png)

*AI Classification Results*
![AI Results](docs/screenshots/ai-results.png)

## 🔧 API Documentation

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/signup` | POST | User registration |
| `/api/auth/login` | POST | User authentication |
| `/api/auth/me` | GET | Get current user |
| `/api/sessions` | GET/POST | List/Create sessions |
| `/api/sessions/{id}` | GET | Get session details |
| `/api/sessions/{id}/preprocess` | POST | Start preprocessing job |
| `/api/jobs/{jobId}` | GET | Get job status |
| `/api/sessions/{id}/analytics/psd` | GET | Get PSD analysis |
| `/api/sessions/{id}/analytics/bandpower` | GET | Get band power analysis |
| `/api/sessions/{id}/classify` | POST | Run AI classification |
| `/ws/stream` | WebSocket | Real-time data streaming |

## 🛠️ Development

### Prerequisites
- Docker & Docker Compose
- Java 17+ (for local backend dev)
- Node.js 18+ (for local frontend dev)
- Python 3.11+ (for local processing dev)

### Local Development
```bash
# Backend
cd backend && ./gradlew bootRun

# Processing
cd processing && uvicorn app.main:app --reload --port 8001

# Frontend
cd frontend && npm run dev

# Database
docker run -d -p 5432:5432 -e POSTGRES_DB=neuroviz postgres:15
```

### Testing
```bash
# Run all tests
make test

# Individual service tests
cd backend && ./gradlew test
cd processing && pytest
cd frontend && npm test
```

## 📊 What I Learned

- **Microservices Architecture**: Designing and implementing a multi-service application with proper service communication
- **Real-time Data Processing**: Building WebSocket-based streaming for neural signal data
- **Signal Processing**: Implementing EEG preprocessing algorithms (filtering, artifact rejection)
- **Machine Learning Integration**: Creating lightweight AI models for neural signal classification
- **Modern Frontend Development**: Building responsive UIs with React, TypeScript, and D3.js
- **Docker Orchestration**: Containerizing and orchestrating multiple services with docker-compose
- **Security Best Practices**: Implementing JWT authentication and secure API design

## 🔮 Future Work

- [ ] Support for additional file formats (EDF, BDF)
- [ ] Advanced artifact detection algorithms
- [ ] Multi-user collaboration features
- [ ] Cloud deployment with Kubernetes
- [ ] Mobile app development
- [ ] Integration with real EEG hardware
- [ ] Advanced ML models for brain-computer interfaces
- [ ] Real-time collaboration and sharing

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Contact

For questions or support, please open an issue or contact [your-email@example.com](mailto:your-email@example.com).
