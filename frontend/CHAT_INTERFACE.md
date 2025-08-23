# Chat Interface

A professional, mobile-responsive chat interface built with React, TypeScript, Zustand, and DaisyUI.

## Features

### ✅ Implemented
- **Responsive Design**: Mobile-first approach with 3-panel layout on desktop
- **Real-time UI**: Prepared for WebSocket integration
- **User Management**: Online status, user profiles, avatars
- **Message Types**: Text messages with support for images and files
- **Conversation Management**: Direct messages and group chats
- **Search**: Search through conversations
- **Modern UI**: Clean, intuitive interface following standard chat UX patterns

### 🚧 Prepared for Future Implementation
- **WebSocket Integration**: Real-time messaging
- **File Upload**: Image and file sharing
- **Emoji Picker**: Emoji support in messages
- **Voice/Video Calls**: Call functionality buttons
- **Message Reactions**: React to messages
- **Message Editing/Deletion**: Edit and delete messages
- **Typing Indicators**: Show when users are typing
- **Message Read Receipts**: Show message read status

## Architecture

### State Management
- **Zustand Store** (`chatStore.ts`): Manages conversations, messages, online users
- **Mock Data**: Includes demo conversations and messages for testing

### Components Structure
```
ChatLayout (Main container)
├── LeftSidebar
│   ├── User Profile
│   ├── Search
│   ├── OnlineUsersList
│   └── ConversationList
├── ChatArea
│   ├── Chat Header
│   ├── MessageList
│   └── MessageInput
└── RightSidebar
    ├── Contact Info
    ├── Shared Files
    └── Shared Links
```

### Responsive Behavior
- **Mobile (< 768px)**: Single panel with drawer navigation
- **Tablet (768px - 1024px)**: Two panels (sidebar + chat)
- **Desktop (> 1024px)**: Three panels (left + chat + right)

## API Integration

The chat interface is designed to work with the existing PERN backend:

### Endpoints Used
- `GET /messages/conversations` - Get user conversations
- `GET /messages/conversations/:id/messages` - Get conversation messages
- `POST /messages/conversations/:id/messages` - Send message
- `POST /messages/users/:id/messages` - Send direct message

### Data Types
- **Conversation**: Direct or group conversations with participants
- **Message**: Text, image, file, or system messages
- **User**: User profiles with online status

## Styling

- **TailwindCSS**: Utility-first CSS framework
- **DaisyUI**: Component library for consistent design
- **Custom CSS Variables**: Defined in App.css for theming
- **Mobile-First**: Responsive design approach

## Usage

The chat interface automatically loads when a user visits the HomePage. It includes:

1. **Demo Data**: Mock conversations and messages for testing
2. **Error Handling**: Graceful fallback to demo data when API fails
3. **Loading States**: Proper loading indicators
4. **Empty States**: Helpful messages when no data is available

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live messaging
2. **File Handling**: Complete file upload and preview functionality
3. **Advanced Features**: Message reactions, editing, threading
4. **Performance**: Virtual scrolling for large message lists
5. **Accessibility**: Enhanced keyboard navigation and screen reader support
6. **Internationalization**: Multi-language support

## Development Notes

- All components are TypeScript-first with proper type definitions
- Error boundaries and loading states are implemented
- The interface gracefully degrades when backend services are unavailable
- Mock data allows for frontend development without backend dependency
- Clean separation of concerns between UI components and business logic
