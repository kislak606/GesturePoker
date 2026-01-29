# V1 Completion Plan - Gesture-Based Poker Game

## Current Status

**Foundation Complete**: The game has a solid technical foundation with:
- ✅ Full Texas Hold'em poker logic (all phases, betting rounds)
- ✅ Sophisticated gesture detection (6 static + temporal gestures)
- ✅ Basic AI opponents using pot odds
- ✅ Hand tracking via MediaPipe
- ✅ 127 passing tests covering all core logic
- ✅ TypeScript strict mode + Zod validation
- ✅ Clean architecture (domain/UI/gestures separated)

**Missing for v1**: Core user experience features to make the game playable and enjoyable.

---

## Phase 1: Essential UX (CRITICAL FOR v1)

### 1.1 Gesture Controls Help Panel ✅ (Implementing Now)
**Priority**: Critical - Players need to know available moves

**Features**:
- Display all available gestures with visual guides
- Show current legal actions based on game state
- Highlight which gestures are currently valid
- Include gesture images/descriptions
- Show confirmation requirements (0.5s for actions, 5s for raise)

**Acceptance Criteria**:
- Panel toggleable (show/hide)
- Updates dynamically based on current player's situation
- Clear visual distinction between available/unavailable moves
- Responsive design that doesn't block game view

**Estimated Complexity**: Medium
**Dependencies**: None

---

### 1.2 Hand Winner Detection & Display
**Priority**: Critical - Players must know who won and why

**Features**:
- Detect winning hand at showdown
- Display winner announcement with hand ranking
- Show all player hands at showdown
- Highlight winning cards
- Display amount won

**Acceptance Criteria**:
- Correctly evaluates all hand rankings
- Handles split pots (ties)
- Clear visual feedback of winner
- Shows hand name (e.g., "Pair of Aces", "Flush")
- Persists for 3-5 seconds before next hand

**Estimated Complexity**: Medium
**Dependencies**: Existing hand-evaluator.ts needs integration

---

### 1.3 Pot Distribution Animation
**Priority**: High - Visual feedback improves player understanding

**Features**:
- Animate chips moving from pot to winner(s)
- Update chip counts with animation
- Show pot total being distributed
- Handle split pots visually

**Acceptance Criteria**:
- Smooth animation (500-1000ms)
- Clear indication of chip flow
- Chip counts update after animation completes
- Works for single and multiple winners

**Estimated Complexity**: Medium
**Dependencies**: Winner detection (1.2)

---

### 1.4 Better AI Decision Making
**Priority**: High - Current AI is too simplistic (pot odds only)

**Features**:
- Integrate hand strength evaluation with AI decisions
- Consider position, stack size, and pot odds together
- Add some randomness to prevent predictability
- Different aggression levels for each bot

**Current Limitation**: AI uses only pot odds, not actual hand value

**Acceptance Criteria**:
- AI considers hand strength (from hand-evaluator.ts)
- Realistic betting behavior (doesn't always fold good hands)
- Bots have distinct playing styles
- AI can bluff occasionally (randomness factor)

**Estimated Complexity**: Medium-High
**Dependencies**: Existing hand-evaluator.ts

---

### 1.5 Improved Raise UI Feedback
**Priority**: Medium - Current bet drag needs visual confirmation

**Features**:
- Real-time bet amount preview during drag
- Visual indicator of drag gesture detection
- Clear all-in indicator when detected
- Show min/max raise amounts
- Increment display ($10, $20, $30, etc.)

**Acceptance Criteria**:
- Bet amount updates in real-time as hand moves
- Clear visual for all-in gesture (upward movement)
- 5-second confirmation countdown visible
- Cancel mechanism if gesture released early

**Estimated Complexity**: Low-Medium
**Dependencies**: Existing temporal-gesture-detector.ts

---

## Phase 2: Game Flow Polish (IMPORTANT FOR v1)

### 2.1 Multi-Hand Session Tracking
**Priority**: Medium - Players want to play multiple hands

**Features**:
- Track statistics across hands: wins, losses, biggest pot
- Show hand history (last 5-10 hands)
- Display current session stats
- Reset button for new session
- Save session data to local storage

**Acceptance Criteria**:
- Stats persist across hands
- History shows winner, pot size, hand ranking
- Session can be reset without restarting app
- Stats survive app restart (localStorage)

**Estimated Complexity**: Medium
**Dependencies**: Winner detection (1.2)

---

### 2.2 Game State Feedback
**Priority**: Medium - Players need clear game status

**Features**:
- Better visual indication of current player turn
- Action history log (last 5 actions)
- Timer for AI thinking (visual delay)
- Clear indication when waiting for player input

**Acceptance Criteria**:
- Current player clearly highlighted
- Action log shows: "Player X raised $50"
- AI "thinks" for 1-2 seconds before acting
- Gesture prompt appears when it's player's turn

**Estimated Complexity**: Low-Medium
**Dependencies**: None

---

### 2.3 Settings Panel
**Priority**: Low-Medium - Quality of life improvements

**Features**:
- Adjust starting chip count ($500, $1000, $2000)
- Adjust blind levels ($5/$10, $10/$20, $25/$50)
- Toggle camera view on/off
- Gesture sensitivity adjustment
- Sound effects on/off (if adding sounds)

**Acceptance Criteria**:
- Settings persist across sessions
- Can be changed between hands
- Clear UI for adjusting values
- Defaults match current implementation

**Estimated Complexity**: Low-Medium
**Dependencies**: None

---

## Phase 3: Nice-to-Have Features (POST-v1, Optional)

### 3.1 Sound Effects
**Priority**: Low - Enhances immersion but not critical

**Features**:
- Card dealing sounds
- Chip sounds on bets
- Winner celebration sound
- Gesture confirmation beep

**Estimated Complexity**: Low
**Dependencies**: None

---

### 3.2 Hand Replay System
**Priority**: Low - Useful for learning/debugging

**Features**:
- Record all actions in a hand
- Replay hand step-by-step
- Show decision points for analysis
- Export hand history

**Estimated Complexity**: High
**Dependencies**: Multi-hand tracking (2.1)

---

### 3.3 Advanced AI Personalities
**Priority**: Low - Makes bots more interesting

**Features**:
- Aggressive bot (raises often)
- Passive bot (calls often, rarely raises)
- Tight bot (folds often, plays premium hands)
- Random personality selection per session

**Estimated Complexity**: Medium
**Dependencies**: Better AI (1.4)

---

### 3.4 Tutorial Mode
**Priority**: Low - Helps new players learn

**Features**:
- Step-by-step poker rules explanation
- Gesture training mode (practice gestures)
- Guided first hand walkthrough
- Tips for hand strength

**Estimated Complexity**: High
**Dependencies**: Gesture help panel (1.1)

---

## Development Approach

### Testing Strategy (Per CLAUDE.md)
- **Every feature must be test-driven (TDD)**
- Write failing test first, implement minimal code, refactor
- Tests must verify behavior, not implementation
- Maintain 100% coverage through business behavior tests
- Use factory functions for test data (existing pattern)

### Implementation Order (Recommended)

**Sprint 1 (Week 1): Critical UX**
1. Gesture controls help panel (1.1) - 2 days
2. Hand winner detection (1.2) - 2 days
3. Pot distribution animation (1.3) - 1 day

**Sprint 2 (Week 2): AI & Feedback**
4. Better AI decisions (1.4) - 3 days
5. Improved raise UI (1.5) - 2 days

**Sprint 3 (Week 3): Game Flow**
6. Multi-hand tracking (2.1) - 2 days
7. Game state feedback (2.2) - 2 days
8. Settings panel (2.3) - 1 day

**Sprint 4 (Week 4): Polish & Testing**
9. End-to-end testing of full game flow
10. Bug fixes and refinements
11. Performance optimization
12. Documentation updates

**Total Estimated Time**: 3-4 weeks for v1 completion

---

## Success Criteria for v1 Release

A complete v1 should allow a player to:
- ✅ Understand all available gestures without external documentation
- ✅ Play multiple hands in a session against competent AI
- ✅ Know who won each hand and why
- ✅ Track their performance across hands
- ✅ Adjust raise amounts intuitively with gestures
- ✅ Have a smooth, bug-free experience from start to finish

**Quality Gates**:
- All tests passing (maintain 100%+ coverage)
- No TypeScript errors (strict mode)
- Smooth 30fps camera + gesture detection
- Clear UI with no confusing states
- AI behaves realistically (not too predictable)
- Game handles edge cases (all-in, ties, running out of chips)

---

## Future Considerations (Post-v1)

### v2 Ideas
- Online multiplayer (replace AI with real players)
- Mobile app version (React Native + TensorFlow.js)
- Tournament mode (increasing blinds, multiple tables)
- Achievements and unlockables
- Custom gesture mapping
- Voice commands integration
- Accessibility features (screen reader support)

### Technical Debt to Address
- Refactor renderer.ts (currently 450+ lines)
- Extract gesture-to-action mapping into separate module
- Create state machine for game phases
- Add proper error boundaries for MediaPipe failures
- Implement proper logging system

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Hand tracking unreliable | Medium | High | Add fallback keyboard controls |
| AI too predictable | High | Medium | Implement randomness + hand strength |
| Performance issues | Low | High | Profile and optimize render loop |
| Showdown logic bugs | Medium | Critical | Comprehensive edge case testing |
| Gesture false positives | Medium | Medium | Increase confirmation threshold |

---

## Conclusion

The poker game has an excellent foundation. Completing v1 requires:
1. **Essential UX improvements** (gesture help, winner detection, pot distribution)
2. **Better AI** (hand strength consideration)
3. **Game flow polish** (multi-hand tracking, feedback)

Following the TDD approach in CLAUDE.md, each feature will be built test-first, ensuring reliability and maintainability. The modular architecture makes adding these features straightforward without major refactoring.

**Next Immediate Step**: Implement gesture controls help panel (already in progress).
