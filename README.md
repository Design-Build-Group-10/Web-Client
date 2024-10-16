# Design & Build - FacePerks - Group 10 - Frontend

Visit [FacePerks](https://service.design-build.site) (https://service.design-build.site) to view the live demo and explore its features.

To view the full project, please visit the following repositories:

- [Server (Backend) Code](https://github.com/Design-Build-Group-10/Server) (https://github.com/Design-Build-Group-10/Server)
- [Web Client (Frontend) Code](https://github.com/Design-Build-Group-10/Web-Client) (https://github.com/Design-Build-Group-10/Web-Client)
- [Upper and Lower Computer Code](https://github.com/Design-Build-Group-10/Lower-And-Upper-Computer) (https://github.com/Design-Build-Group-10/Lower-And-Upper-Computer)
- [Face Recognition Code](https://github.com/Design-Build-Group-10/FaceRecognition) (https://github.com/Design-Build-Group-10/FaceRecognition)

## Table of Contents

1. [Project Overview](#project-overview)
2. [Project Setup](#project-setup)
   - [Compile and Hot-Reload for Development](#compile-and-hot-reload-for-development)
   - [Type-Check, Compile and Minify for Production](#type-check-compile-and-minify-for-production)
   - [Lint with ESLint](#lint-with-eslint)
3. [Features](#features)
   - [User Features](#user-features)
   - [Merchant Features](#merchant-features)
4. [Personalization](#personalization)
5. [Message Center](#message-center)
6. [Admin Functionalities](#admin-functionalities)
7. [Face Recognition](#face-recognition)
8. [Localization & Theme](#localization--theme)
9. [IDE Setup](#ide-setup)

## Project Overview

FacePerks is a Vue 3-based e-commerce platform that provides a personalized shopping experience with integrated face
recognition features. The project is built with Vite for fast development and WebSockets for real-time updates. The
platform allows both customers and merchants to interact with the system, including facial recognition for login,
product browsing, and personalized user interfaces.

## Project Setup

To get started with the project, clone the repository and install dependencies.

```sh
pnpm install
```

### Compile and Hot-Reload for Development

To start the development server and see live changes:

```sh
pnpm dev
```

### Type-Check, Compile and Minify for Production

To build the project for production deployment:

```sh
pnpm build
```

### Lint with ESLint

Ensure code quality and consistency by running:

```sh
pnpm lint
```

## Features

### User Features

The platform offers several functionalities for customers:

1. **Registration & Login**:  
   Users can create an account and log in using their credentials.
    - **Face Recognition Login**: Users can also log in via facial recognition for a seamless experience.

2. **Product Management**:
    - View all available products.
    - Click on any product to view detailed information.
    - Add products to the shopping cart.
    - **Shopping Cart**: Users can view the cart, adjust quantities, remove items, or proceed to checkout.

3. **Browsing History**:  
   The system tracks the user's browsing history. Users can revisit their browsing history, click on previously viewed
   items, and add them to the cart again.

### Merchant Features

For merchants, additional features are provided to manage shops and products:

1. **Shop Registration**:  
   Merchants can register new shops by filling out details such as:
    - Shop name
    - Description
    - Address
    - Business hours
    - Contact details
    - Promotional activities
    - Shop logo

2. **Product Management**:  
   Merchants can:
    - Add new products.
    - Update existing product information.
    - Manage promotions.

3. **Robot Integration**:  
   Merchants can manage their service robots, view live footage, and access data on customers detected by the robots.

4. **Real-time Face Recognition**:  
   Merchants can enable face recognition for their robots to detect customers and enhance customer interaction.

### Personalization

1. **User Profile**:  
   Users can modify their profile information such as:
    - Email
    - Phone number
    - Shipping address
    - Payment method
    - Profile picture

2. **Theme Customization**:  
   Users can adjust:
    - Theme (light or dark)
    - Font size (useful for users with visual impairments)
    - Colors (in RGB, HSL, or HEX formats)

3. **Multi-language Support**:  
   FacePerks supports the following languages:
    - English
    - Simplified Chinese (zh-CN)
    - Traditional Chinese (zh-TW)
    - Japanese
    - French

4. **Quick Theme & Language Switching**:  
   A quick toggle is provided for theme and language changes, allowing users to seamlessly switch between dark/light
   mode and English/Chinese.

### Message Center

The message center keeps users updated with notifications such as:

1. **Points System**:  
   Users earn 5 points if their login time exceeds 10 minutes since the previous login. Additionally, if a user is
   recognized by a robot, they earn another 5 points.  
   Points help determine user activity and engagement levels, which may unlock special offers and services.

2. **Points Display**:  
   The user's current point total is always visible at the top-right corner of the screen.

### Admin Functionalities

Apart from user functionalities, FacePerks offers additional tools for admins or merchants:

- **Robot Management**: Admins can view detailed robot information (e.g., serial number) and connect to a live stream to
  monitor the robot's view and detect users via face recognition.

- **WebSocket Integration**: Through WebSockets, admins can connect to the robot in real time, enabling or disabling
  facial recognition for enhanced customer interaction.

## Face Recognition

FacePerks integrates facial recognition for multiple features:

- **Login via Face**: A unique and secure login option for users.
- **Robot Integration**: Service robots detect and recognize users, enhancing the user experience by awarding points or
  triggering automated interactions.

**Note**: Due to server limitations (CPU-only), enabling facial recognition may reduce the frame rate of the live feed
from the robot.

## Localization & Theme

FacePerks supports dynamic localization with multiple languages, offering a personalized experience based on user
preferences. In addition, users can switch between light and dark themes, adjust font sizes, and customize colors.

- Supported Languages:
    - English
    - Simplified Chinese (zh-CN)
    - Traditional Chinese (zh-TW)
    - Japanese
    - French

## IDE Setup

We recommend using [WebStorm](https://www.jetbrains.com/webstorm/) as the IDE for development, which provides excellent
support for Vue 3 projects.
