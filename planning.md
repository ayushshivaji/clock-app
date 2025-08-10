# Clock App Planning

## Project Overview
React Native clock app using Expo for web and iOS platforms.

## Design Analysis
Based on the provided design (design.webp), I can see:
- **Style**: Dark theme with gradient background (dark purple/navy)
- **Clock Type**: Circular design with numbers around the perimeter
- **Time Display**: Large digital time in center (10:35 format)
- **Visual Elements**: 
  - Numbers arranged in a circle (appears to show seconds/minutes)
  - Gradient circle border (cyan to orange/yellow)
  - Currently highlighted number: 46 (with golden glow effect)
  - Clean, minimalist aesthetic

## Clarifying Questions Based on Design

### Functionality
1. **Clock Behavior**
   - The highlighted "46" appears to be seconds. Should this move around the circle as time progresses? Yes it should move around as the time progresses. 
   - Should the gradient border rotate or animate with time? Yes
   - Is this the only view, or are there other screens (settings, alarms, etc.)? Make two screens, one homepage where clock resides and a settings page which will help us change the timezone, colour scheme, dark vs light mode settings 12hr vs 24hr format.

2. **Number Ring**
   - What do the numbers around the circle represent? (seconds, minutes, or both?) The numbers represent seconds.
   - Should users be able to interact with these numbers (tap to set time/alarm)? Non interactable.

3. **Time Format**
   - Should the app support both 12-hour and 24-hour formats? Yes both should be supported.
   - Currently shows 10:35 - should seconds be displayed too? No

### Interactive Features
4. **User Interactions**
   - Can users tap/swipe to access additional features? No
   - Should there be any gesture controls (swipe for different clock faces, pinch to zoom)? No

5. **Additional Screens**
   - Do you need settings/preferences screen? Yes. 
   - Alarm management screen? No.
   - Timer/stopwatch views following the same design language? No.

### Technical Considerations
6. **Animations**
   - How smooth should the second hand movement be? (tick vs smooth sweep) It should be smooth sweep.
   - Should the gradient colors shift over time or remain static? Yes it should shift generically over time.
   - Any transition animations between screens? A swipe animation between the settings and the homepage.

7. **Platform Differences**
   - Should the web version be fullscreen like a screensaver? Yes it should be fullscreen.
   - For iOS, do you want haptic feedback for interactions? No.
   - Should it support iPad as well as iPhone? No.

8. **Performance**
   - The design suggests continuous animation. Any concerns about battery usage? No.
   - Should the app have a low-power mode? No.

## My Suggestions for Remaining Decisions

### Color Schemes
- **Dark Mode (Default)**: As shown in the design - dark purple/navy background
- **Light Mode**: White/light gray background with darker text and softer gradient colors
- **Additional Themes**: 
  - Ocean (blue-green gradients)
  - Sunset (orange-pink gradients)
  - Forest (green-yellow gradients)
  - Monochrome (black/white/gray)

### Navigation
- Settings icon (gear) in top-right corner of main screen
- Swipe gesture or back button to return from settings to clock

### Settings Options
1. **Time Zone**: Dropdown with major cities/time zones
2. **Time Format**: Toggle between 12/24 hour
3. **Theme**: Color scheme selector with preview
4. **Appearance**: Dark/Light mode toggle
5. **Animations**: Option to reduce motion for accessibility

## Phase-Based Development Plan

### Phase 1: Project Setup & Core Structure (Day 1)
1. Initialize Expo project with TypeScript
2. Set up project structure:
   - `/components` - Reusable UI components
   - `/screens` - Main clock and settings screens
   - `/utils` - Time calculations and helpers
   - `/constants` - Colors, themes, configurations
   - `/hooks` - Custom React hooks
3. Install dependencies:
   - React Navigation for screen navigation
   - React Native Reanimated for smooth animations
   - React Native SVG for gradient effects
   - AsyncStorage for persisting settings
4. Configure navigation structure
5. Set up basic theme context

### Phase 2: Clock Display Implementation (Day 2-3)
1. Create time display component (digital clock center)
2. Implement circular seconds indicator:
   - Generate 60 number positions around circle
   - Calculate positions using trigonometry
   - Create number components with proper styling
3. Implement current second highlighting:
   - Golden glow effect for active second
   - Smooth transition between seconds
4. Add gradient border circle
5. Implement time update logic with useEffect

### Phase 3: Animations (Day 4-5)
1. Implement smooth second hand sweep animation
2. Create rotating gradient border animation
3. Add number highlight transition effects
4. Implement smooth color transitions for theme changes
5. Test performance on both platforms

### Phase 4: Settings Screen (Day 6)
1. Design settings UI following app aesthetic
2. Implement settings components:
   - Time zone selector
   - 12/24 hour format toggle
   - Theme/color scheme picker
   - Dark/light mode toggle
3. Connect settings to AsyncStorage
4. Apply settings to clock display in real-time

### Phase 5: Navigation & Polish (Day 7)
1. Implement swipe navigation between screens
2. Add settings icon to main screen
3. Create smooth screen transitions
4. Add loading states and error handling
5. Implement proper TypeScript types throughout

### Phase 6: Platform Optimization (Day 8)
1. Web-specific features:
   - Fullscreen mode implementation
   - Keyboard shortcuts for settings
   - Responsive design for different screen sizes
2. iOS-specific features:
   - Safe area handling
   - iOS-specific gesture recognizers
3. Performance optimization:
   - Minimize re-renders
   - Optimize animation frame rates

### Phase 7: Testing & Refinement (Day 9-10)
1. Cross-platform testing (Web, iOS simulator, physical device)
2. Performance profiling and optimization
3. Accessibility improvements
4. Bug fixes and edge case handling
5. Code cleanup and documentation

## Technical Implementation Details

### Key Technologies
- **Expo SDK 50+** with Expo Router
- **TypeScript** for type safety
- **React Native Reanimated 3** for animations
- **React Native SVG** for gradients
- **React Context** for theme/settings management

### Animation Strategy
- Use `requestAnimationFrame` for smooth second updates
- Reanimated for gradient rotation (60s full rotation)
- Shared values for synchronized animations
- Transform animations for number highlighting

### State Management
- React Context for global settings
- Local state for time updates
- AsyncStorage for persistence

### Performance Considerations
- Memoize expensive calculations
- Use React.memo for static components
- Implement animation frame throttling
- Lazy load settings screen
