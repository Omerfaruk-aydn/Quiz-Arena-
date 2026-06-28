import {
  createQuizSchema,
  addQuestionSchema,
  reorderQuestionsSchema,
} from '../api/validators/quiz.validator.js';

describe('Quiz Validators', () => {
  describe('createQuizSchema', () => {
    it('should accept valid quiz data', () => {
      const result = createQuizSchema.safeParse({
        title: 'Matematik Testi',
        description: 'Temel matematik soruları',
        category: 'Matematik',
        difficulty: 'medium',
      });
      expect(result.success).toBe(true);
    });

    it('should reject title longer than 100 chars', () => {
      const result = createQuizSchema.safeParse({
        title: 'a'.repeat(101),
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty title', () => {
      const result = createQuizSchema.safeParse({ title: '' });
      expect(result.success).toBe(false);
    });

    it('should accept optional fields', () => {
      const result = createQuizSchema.safeParse({
        title: 'Test Quiz',
        isPublic: true,
        tags: ['math', 'easy'],
      });
      expect(result.success).toBe(true);
    });

    it('should reject more than 10 tags', () => {
      const result = createQuizSchema.safeParse({
        title: 'Test',
        tags: Array(11).fill('tag'),
      });
      expect(result.success).toBe(false);
    });
  });

  describe('addQuestionSchema', () => {
    it('should accept valid question', () => {
      const result = addQuestionSchema.safeParse({
        text: '2 + 2 = ?',
        answers: [
          { text: '3', isCorrect: false, color: 'red' },
          { text: '4', isCorrect: true, color: 'blue' },
          { text: '5', isCorrect: false, color: 'yellow' },
          { text: '6', isCorrect: false, color: 'green' },
        ],
      });
      expect(result.success).toBe(true);
    });

    it('should reject question with less than 2 answers', () => {
      const result = addQuestionSchema.safeParse({
        text: 'Test',
        answers: [{ text: 'Yes', isCorrect: true, color: 'red' }],
      });
      expect(result.success).toBe(false);
    });

    it('should reject question with more than 4 answers', () => {
      const result = addQuestionSchema.safeParse({
        text: 'Test',
        answers: [
          { text: 'A', isCorrect: true, color: 'red' },
          { text: 'B', isCorrect: false, color: 'blue' },
          { text: 'C', isCorrect: false, color: 'yellow' },
          { text: 'D', isCorrect: false, color: 'green' },
          { text: 'E', isCorrect: false, color: 'red' },
        ],
      });
      expect(result.success).toBe(false);
    });

    it('should reject question with no correct answer', () => {
      const result = addQuestionSchema.safeParse({
        text: 'Test',
        answers: [
          { text: 'A', isCorrect: false, color: 'red' },
          { text: 'B', isCorrect: false, color: 'blue' },
        ],
      });
      expect(result.success).toBe(false);
    });

    it('should reject question with multiple correct answers', () => {
      const result = addQuestionSchema.safeParse({
        text: 'Test',
        answers: [
          { text: 'A', isCorrect: true, color: 'red' },
          { text: 'B', isCorrect: true, color: 'blue' },
        ],
      });
      expect(result.success).toBe(false);
    });
  });

  describe('reorderQuestionsSchema', () => {
    it('should accept valid ordered IDs', () => {
      const result = reorderQuestionsSchema.safeParse({
        orderedIds: ['id1', 'id2', 'id3'],
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty array', () => {
      const result = reorderQuestionsSchema.safeParse({ orderedIds: [] });
      expect(result.success).toBe(true);
    });
  });
});
