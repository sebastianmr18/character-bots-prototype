import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    // Utils — all tested
    'utils/api.utils.ts',
    'utils/character.utils.ts',
    'utils/editorial.utils.ts',
    'utils/live-audio.utils.ts',
    'utils/message.utils.ts',
    'utils/status.utils.ts',
    // Lib
    'lib/utils.ts',
    'lib/api/backend-proxy.ts',
    // Hooks — tested
    'hooks/use-mobile.ts',
    'hooks/useAnimatedEntryKeys.ts',
    'hooks/useAudioContext.ts',
    'hooks/useAuth.ts',
    'hooks/useCharacterById.tsx',
    'hooks/useCharacters.tsx',
    'hooks/useConversationId.tsx',
    'hooks/useMessagePolling.ts',
    'hooks/useWebSocket.tsx',
    // Components — tested
    'components/ui/features/characters/shared/StatusIndicator.tsx',
    'components/ui/features/characters/shared/StreamingText.tsx',
    'components/ui/features/characters/shared/AudioMessagePlayer.tsx',
    'components/ui/features/characters/modes/chat/TypingIndicator.tsx',
    'components/ui/features/characters/modes/chat/ChatInput.tsx',
    'components/ui/features/characters/modes/chat/ChatMessages.tsx',
    'components/ui/features/uploads/KnowledgeBaseUploadCard.tsx',
    'components/ui/features/uploads/DeleteCharacterCard.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  testMatch: ['**/__tests__/**/*.(test|spec).(ts|tsx)'],
}

export default createJestConfig(config)
