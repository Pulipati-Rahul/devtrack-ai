import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../src/app';

// Mock auth check
vi.mock('../src/auth/auth', () => {
  return {
    auth: {
      api: {
        getSession: vi.fn().mockResolvedValue({
          session: { id: 'session-id', userId: 'user-id' },
          user: { id: 'user-id', email: 'test@example.com', role: 'USER' },
        }),
      },
    },
  };
});

// Mock repositories
vi.mock('../src/repositories/project.repository', () => {
  const dummyProject = {
    id: 'proj-123',
    userId: 'user-id',
    title: 'Alpha App',
    description: 'Track software workflows.',
    status: 'Planning',
    priority: 'Medium',
    githubUrl: 'https://github.com/test/alpha',
    liveUrl: 'https://alpha.test',
    technologies: 'React, Node.js',
    startDate: new Date(),
    targetDate: new Date(),
    completedDate: null,
    progress: 50,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const dummyTask = {
    id: 'task-123',
    projectId: 'proj-123',
    title: 'Code schemas',
    description: 'Relational mappings',
    status: 'Todo',
    priority: 'High',
    dueDate: new Date(),
    assignedTo: 'Developer A',
    tags: 'Backend',
    notes: 'Draft complete',
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return {
    projectRepository: {
      listProjects: vi.fn().mockResolvedValue([dummyProject]),
      getProjectById: vi.fn().mockResolvedValue(dummyProject),
      createProject: vi.fn().mockImplementation((data) => ({
        id: 'new-proj-id',
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      updateProject: vi.fn().mockImplementation((id, data) => ({
        ...dummyProject,
        ...data,
        updatedAt: new Date(),
      })),
      deleteProject: vi.fn().mockResolvedValue({ id: 'proj-123' }),
      getProjectStats: vi.fn().mockResolvedValue({
        totalCount: 1,
        activeCount: 1,
        completedCount: 0,
        archivedCount: 0,
        avgProgress: 50,
      }),
      duplicateProject: vi.fn().mockResolvedValue({
        id: 'dup-proj-id',
        title: 'Alpha App Copy',
        userId: 'user-id',
      }),
      getProjectTasks: vi.fn().mockResolvedValue([dummyTask]),
      getTaskById: vi.fn().mockResolvedValue(dummyTask),
      createTask: vi.fn().mockImplementation((data) => ({
        id: 'new-task-id',
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      updateTask: vi.fn().mockImplementation((id, data) => ({
        id,
        ...dummyTask,
        ...data,
        updatedAt: new Date(),
      })),
      deleteTask: vi.fn().mockResolvedValue({ id: 'task-123' }),
      getProjectNotes: vi.fn().mockResolvedValue([]),
      getProjectResources: vi.fn().mockResolvedValue([]),
      getProjectAttachments: vi.fn().mockResolvedValue([]),
    },
  };
});

// Mock DB utilities health check
vi.mock('../src/db/utilities', () => {
  return {
    healthCheck: vi.fn().mockResolvedValue(true),
  };
});

describe('Project Tracker Module API Endpoints', () => {
  it('should list projects on GET /api/v1/projects', async () => {
    const res = await request(app).get('/api/v1/projects');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data[0].title).toBe('Alpha App');
  });

  it('should calculate consolidated stats on GET /api/v1/projects/stats', async () => {
    const res = await request(app).get('/api/v1/projects/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalCount).toBe(1);
    expect(res.body.data.avgProgress).toBe(50);
  });

  it('should get project full boards details on GET /api/v1/projects/:id', async () => {
    const res = await request(app).get('/api/v1/projects/proj-123');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.project.id).toBe('proj-123');
    expect(res.body.data.tasks[0].title).toBe('Code schemas');
  });

  it('should create a project on POST /api/v1/projects', async () => {
    const res = await request(app)
      .post('/api/v1/projects')
      .send({ title: 'Beta UI', technologies: 'Svelte' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Beta UI');
  });

  it('should duplicate project on POST /api/v1/projects/:id/duplicate', async () => {
    const res = await request(app)
      .post('/api/v1/projects/proj-123/duplicate')
      .send({ title: 'Alpha App Copy' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('dup-proj-id');
  });

  it('should add task to project on POST /api/v1/projects/:id/tasks', async () => {
    const res = await request(app)
      .post('/api/v1/projects/proj-123/tasks')
      .send({ title: 'Write tests', status: 'Todo', priority: 'Medium' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Write tests');
  });

  it('should shift task status on PUT /api/v1/projects/:id/tasks/:taskId', async () => {
    const res = await request(app)
      .put('/api/v1/projects/proj-123/tasks/task-123')
      .send({ status: 'Done' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('Done');
  });

  it('should remove task from project on DELETE /api/v1/projects/:id/tasks/:taskId', async () => {
    const res = await request(app).delete('/api/v1/projects/proj-123/tasks/task-123');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('task-123');
  });
});
