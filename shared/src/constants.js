"use strict";
/**
 * DevTrack AI Shared Constants
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_ROUTES = exports.DsaDifficulty = exports.TaskStatus = exports.ProjectStatus = exports.UserRole = exports.APP_NAME = void 0;
exports.APP_NAME = 'DevTrack AI';
var UserRole;
(function (UserRole) {
    UserRole["GUEST"] = "guest";
    UserRole["USER"] = "user";
    UserRole["ADMIN"] = "admin";
})(UserRole || (exports.UserRole = UserRole = {}));
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus["PLANNING"] = "planning";
    ProjectStatus["IN_PROGRESS"] = "in_progress";
    ProjectStatus["COMPLETED"] = "completed";
    ProjectStatus["PAUSED"] = "paused";
})(ProjectStatus || (exports.ProjectStatus = ProjectStatus = {}));
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["TODO"] = "todo";
    TaskStatus["IN_PROGRESS"] = "in_progress";
    TaskStatus["COMPLETED"] = "completed";
})(TaskStatus || (exports.TaskStatus = TaskStatus = {}));
var DsaDifficulty;
(function (DsaDifficulty) {
    DsaDifficulty["EASY"] = "easy";
    DsaDifficulty["MEDIUM"] = "medium";
    DsaDifficulty["HARD"] = "hard";
})(DsaDifficulty || (exports.DsaDifficulty = DsaDifficulty = {}));
exports.API_ROUTES = {
    HEALTH: '/api/health',
    AUTH: {
        REGISTER: '/api/auth/register',
        LOGIN: '/api/auth/login',
        LOGOUT: '/api/auth/logout',
        ME: '/api/auth/me',
    },
    PROFILE: '/api/profile',
    RESUMES: {
        BASE: '/api/resumes',
        ANALYZE: '/api/resumes/analyze',
    },
    PORTFOLIO: '/api/portfolio',
    PROJECTS: '/api/projects',
    DSA: '/api/dsa',
    INTERVIEWS: '/api/interviews',
    AI: '/api/ai',
    ANALYTICS: '/api/analytics',
    SETTINGS: '/api/settings',
};
