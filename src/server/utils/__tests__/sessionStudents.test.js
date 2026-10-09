// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { MAX_STUDENTS_PER_SESSION, resolveSessionStudents } from '../sessionStudents.js';

describe('resolveSessionStudents', () => {
  it('accepts one individual student and normalizes the KU ID', () => {
    expect(resolveSessionStudents({
      sessionType: 'individual',
      studentId: '  K000001  '
    })).toEqual({ studentIds: ['K000001'] });
  });

  it('requires exactly one student for an individual session', () => {
    expect(resolveSessionStudents({
      sessionType: 'individual',
      studentIds: ['K000001', 'K000002']
    })).toEqual({ error: 'Individual session must have exactly 1 student' });
  });

  it('requires at least two students for a group session', () => {
    expect(resolveSessionStudents({
      sessionType: 'group',
      studentIds: ['K000001']
    })).toEqual({ error: 'Group session must have at least 2 students' });
  });

  it('accepts a group session with two students', () => {
    expect(resolveSessionStudents({
      sessionType: 'group',
      students: [{ student_id: 'K000001' }, { student_id: 'K000002' }]
    })).toEqual({ studentIds: ['K000001', 'K000002'] });
  });

  it('rejects duplicate students', () => {
    expect(resolveSessionStudents({
      sessionType: 'group',
      studentIds: ['K000001', 'K000001']
    })).toEqual({ error: 'A student can only be added once per session' });
  });

  it('rejects more than the maximum allowed students', () => {
    const studentIds = Array.from(
      { length: MAX_STUDENTS_PER_SESSION + 1 },
      (_, index) => `K${index}`
    );

    expect(resolveSessionStudents({
      sessionType: 'group',
      studentIds
    })).toEqual({ error: `A session can include at most ${MAX_STUDENTS_PER_SESSION} students` });
  });

  it('rejects a non-array student_ids payload', () => {
    expect(resolveSessionStudents({
      sessionType: 'individual',
      studentIds: 'K000001'
    })).toEqual({ error: 'Invalid students payload' });
  });

  it('rejects an unsupported session type', () => {
    expect(resolveSessionStudents({
      sessionType: 'pair',
      studentIds: ['K000001']
    })).toEqual({ error: 'Invalid session type' });
  });
});
