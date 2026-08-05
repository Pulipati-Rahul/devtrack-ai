'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Link as LinkIcon,
  Github,
  Linkedin,
  Globe,
  Twitter,
  GraduationCap,
  Briefcase,
  Code2,
  Award,
  Trophy,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Loader2,
  Calendar,
  UserCheck,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { apiClient } from '@/lib/api-client';
import { Container } from '@/components/layout/reusable';

// Local UI Toast Notifier State
interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = React.useState<
    'personal' | 'socials' | 'education' | 'experience' | 'skills' | 'credentials'
  >('personal');

  // local toast notification state
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // --- 1. React Query Hooks ---
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['userProfileData'],
    queryFn: () => apiClient.get<any>('/profile'),
  });

  const updateProfileMutation = useMutation({
    mutationFn: (payload: any) => apiClient.put<any>('/profile', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfileData'] });
      showToast('Profile info updated successfully');
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to update profile details', 'error');
    },
  });

  const addEduMutation = useMutation({
    mutationFn: (payload: any) => apiClient.post<any>('/profile/education', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfileData'] });
      showToast('Education details added successfully');
      setEduFormOpen(false);
      resetEduForm();
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to add education', 'error');
    },
  });

  const updateEduMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      apiClient.put<any>(`/profile/education/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfileData'] });
      showToast('Education details updated successfully');
      setEduFormOpen(false);
      resetEduForm();
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to update education', 'error');
    },
  });

  const deleteEduMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete<any>(`/profile/education/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfileData'] });
      showToast('Education details deleted successfully');
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to delete education', 'error');
    },
  });

  const addExpMutation = useMutation({
    mutationFn: (payload: any) => apiClient.post<any>(`/profile/experience`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfileData'] });
      showToast('Experience records added successfully');
      setExpFormOpen(false);
      resetExpForm();
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to add work experience', 'error');
    },
  });

  const updateExpMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      apiClient.put<any>(`/profile/experience/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfileData'] });
      showToast('Experience records updated successfully');
      setExpFormOpen(false);
      resetExpForm();
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to update experience', 'error');
    },
  });

  const deleteExpMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete<any>(`/profile/experience/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfileData'] });
      showToast('Experience records deleted successfully');
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to delete experience', 'error');
    },
  });

  const addSkillMutation = useMutation({
    mutationFn: (payload: any) => apiClient.post<any>('/profile/skill', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfileData'] });
      showToast('Skill tag created successfully');
      setNewSkillName('');
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to add skill', 'error');
    },
  });

  const deleteSkillMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete<any>(`/profile/skill/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfileData'] });
      showToast('Skill tag deleted successfully');
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to delete skill', 'error');
    },
  });

  const addCertMutation = useMutation({
    mutationFn: (payload: any) => apiClient.post<any>('/profile/certification', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfileData'] });
      showToast('Certification credentials added successfully');
      setCertFormOpen(false);
      resetCertForm();
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to add certification', 'error');
    },
  });

  const updateCertMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      apiClient.put<any>(`/profile/certification/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfileData'] });
      showToast('Certification credentials updated successfully');
      setCertFormOpen(false);
      resetCertForm();
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to update certification', 'error');
    },
  });

  const deleteCertMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete<any>(`/profile/certification/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfileData'] });
      showToast('Certification deleted successfully');
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to delete certification', 'error');
    },
  });

  const addAchMutation = useMutation({
    mutationFn: (payload: any) => apiClient.post<any>('/profile/achievement', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfileData'] });
      showToast('Achievement logged successfully');
      setAchFormOpen(false);
      resetAchForm();
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to log achievement', 'error');
    },
  });

  const updateAchMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      apiClient.put<any>(`/profile/achievement/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfileData'] });
      showToast('Achievement details updated successfully');
      setAchFormOpen(false);
      resetAchForm();
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to update achievement', 'error');
    },
  });

  const deleteAchMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete<any>(`/profile/achievement/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfileData'] });
      showToast('Achievement deleted successfully');
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to delete achievement', 'error');
    },
  });

  // --- Helper Bio Functions ---
  const parseBio = (bioString: string) => {
    try {
      const parsed = JSON.parse(bioString);
      if (parsed && typeof parsed === 'object') {
        return {
          bioText: parsed.bioText || '',
          yearsOfExperience: parsed.yearsOfExperience || '',
          techStack: parsed.techStack || '',
          leetcodeUrl: parsed.leetcodeUrl || '',
          hackerrankUrl: parsed.hackerrankUrl || '',
        };
      }
    } catch (e) {
      void e;
    }
    return {
      bioText: bioString || '',
      yearsOfExperience: '',
      techStack: '',
      leetcodeUrl: '',
      hackerrankUrl: '',
    };
  };

  const serializeBio = (
    bioText: string,
    yearsOfExperience: string,
    techStack: string,
    leetcodeUrl: string,
    hackerrankUrl: string
  ) => {
    return JSON.stringify({
      bioText,
      yearsOfExperience,
      techStack,
      leetcodeUrl,
      hackerrankUrl,
    });
  };

  // --- 2. Form States & Resets ---
  // Personal & Contacts
  const [personalState, setPersonalState] = React.useState({
    fullName: '',
    username: '',
    phone: '',
    headline: '',
    gender: '',
    dob: '',
    country: '',
    state: '',
    city: '',
    avatar: '',
    bioText: '',
    yearsOfExperience: '',
    techStack: '',
  });

  // Social Links
  const [socialState, setSocialState] = React.useState({
    githubUrl: '',
    linkedinUrl: '',
    portfolioUrl: '',
    twitterUrl: '',
    leetcodeUrl: '',
    hackerrankUrl: '',
  });

  // Avatar Files States
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('Only image files are allowed', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image must be under 5MB', 'error');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    setPreviewUrl('');
  };

  // Education Forms
  const [eduFormOpen, setEduFormOpen] = React.useState(false);
  const [eduEditId, setEduEditId] = React.useState<string | null>(null);
  const [eduState, setEduState] = React.useState<{
    college: string;
    degree: string;
    branch: string;
    cgpa: string;
    startYear: number;
    endYear: number | null;
    description: string;
  }>({
    college: '',
    degree: '',
    branch: '',
    cgpa: '',
    startYear: new Date().getFullYear(),
    endYear: new Date().getFullYear() + 4,
    description: '',
  });
  const resetEduForm = () => {
    setEduEditId(null);
    setEduState({
      college: '',
      degree: '',
      branch: '',
      cgpa: '',
      startYear: new Date().getFullYear(),
      endYear: new Date().getFullYear() + 4,
      description: '',
    });
  };

  // Experience Forms
  const [expFormOpen, setExpFormOpen] = React.useState(false);
  const [expEditId, setExpEditId] = React.useState<string | null>(null);
  const [expState, setExpState] = React.useState({
    company: '',
    position: '',
    employmentType: 'Full-Time',
    currentlyWorking: false,
    startDate: '',
    endDate: '',
    description: '',
  });
  const resetExpForm = () => {
    setExpEditId(null);
    setExpState({
      company: '',
      position: '',
      employmentType: 'Full-Time',
      currentlyWorking: false,
      startDate: '',
      endDate: '',
      description: '',
    });
  };

  // Skills
  const [newSkillName, setNewSkillName] = React.useState('');
  const [newSkillCategory, setNewSkillCategory] = React.useState<any>('Languages');
  const [newSkillLevel, setNewSkillLevel] = React.useState<any>('Intermediate');

  // Certifications
  const [certFormOpen, setCertFormOpen] = React.useState(false);
  const [certEditId, setCertEditId] = React.useState<string | null>(null);
  const [certState, setCertState] = React.useState({
    title: '',
    issuer: '',
    issueDate: '',
    credentialId: '',
    credentialUrl: '',
  });
  const resetCertForm = () => {
    setCertEditId(null);
    setCertState({
      title: '',
      issuer: '',
      issueDate: '',
      credentialId: '',
      credentialUrl: '',
    });
  };

  // Achievements
  const [achFormOpen, setAchFormOpen] = React.useState(false);
  const [achEditId, setAchEditId] = React.useState<string | null>(null);
  const [achState, setAchState] = React.useState({
    title: '',
    description: '',
    date: '',
  });
  const resetAchForm = () => {
    setAchEditId(null);
    setAchState({
      title: '',
      description: '',
      date: '',
    });
  };

  // Sync state with fetched database data
  React.useEffect(() => {
    if (data?.profile) {
      const parsedBio = parseBio(data.profile.bio || '');
      setPersonalState({
        fullName: data.profile.fullName || '',
        username: data.profile.username || '',
        phone: data.profile.phone || '',
        headline: data.profile.headline || '',
        gender: data.profile.gender || '',
        dob: data.profile.dob ? new Date(data.profile.dob).toISOString().split('T')[0] : '',
        country: data.profile.country || '',
        state: data.profile.state || '',
        city: data.profile.city || '',
        avatar: data.profile.avatar || '',
        bioText: parsedBio.bioText,
        yearsOfExperience: parsedBio.yearsOfExperience,
        techStack: parsedBio.techStack,
      });

      setSocialState({
        githubUrl: data.profile.githubUrl || '',
        linkedinUrl: data.profile.linkedinUrl || '',
        portfolioUrl: data.profile.portfolioUrl || '',
        twitterUrl: data.profile.twitterUrl || '',
        leetcodeUrl: parsedBio.leetcodeUrl,
        hackerrankUrl: parsedBio.hackerrankUrl,
      });
    }
  }, [data]);

  // Unsaved changes detection hooks
  const isPersonalDirty = React.useMemo(() => {
    if (!data?.profile) return false;
    const p = data.profile;
    const pb = parseBio(p.bio || '');
    return (
      personalState.fullName !== (p.fullName || '') ||
      personalState.username !== (p.username || '') ||
      personalState.phone !== (p.phone || '') ||
      personalState.headline !== (p.headline || '') ||
      personalState.gender !== (p.gender || '') ||
      personalState.dob !== (p.dob ? new Date(p.dob).toISOString().split('T')[0] : '') ||
      personalState.country !== (p.country || '') ||
      personalState.state !== (p.state || '') ||
      personalState.city !== (p.city || '') ||
      personalState.bioText !== pb.bioText ||
      personalState.yearsOfExperience !== pb.yearsOfExperience ||
      personalState.techStack !== pb.techStack
    );
  }, [personalState, data]);

  const isSocialsDirty = React.useMemo(() => {
    if (!data?.profile) return false;
    const p = data.profile;
    const pb = parseBio(p.bio || '');
    return (
      socialState.githubUrl !== (p.githubUrl || '') ||
      socialState.linkedinUrl !== (p.linkedinUrl || '') ||
      socialState.portfolioUrl !== (p.portfolioUrl || '') ||
      socialState.twitterUrl !== (p.twitterUrl || '') ||
      socialState.leetcodeUrl !== pb.leetcodeUrl ||
      socialState.hackerrankUrl !== pb.hackerrankUrl
    );
  }, [socialState, data]);

  const isAnyDirty = isPersonalDirty || isSocialsDirty || selectedFile !== null || previewUrl === '';

  // Cancel Handler
  const handleCancelChanges = () => {
    if (data?.profile) {
      const p = data.profile;
      const pb = parseBio(p.bio || '');
      setPersonalState({
        fullName: p.fullName || '',
        username: p.username || '',
        phone: p.phone || '',
        headline: p.headline || '',
        gender: p.gender || '',
        dob: p.dob ? new Date(p.dob).toISOString().split('T')[0] : '',
        country: p.country || '',
        state: p.state || '',
        city: p.city || '',
        avatar: p.avatar || '',
        bioText: pb.bioText,
        yearsOfExperience: pb.yearsOfExperience,
        techStack: pb.techStack,
      });

      setSocialState({
        githubUrl: p.githubUrl || '',
        linkedinUrl: p.linkedinUrl || '',
        portfolioUrl: p.portfolioUrl || '',
        twitterUrl: p.twitterUrl || '',
        leetcodeUrl: pb.leetcodeUrl,
        hackerrankUrl: pb.hackerrankUrl,
      });

      setSelectedFile(null);
      setPreviewUrl(null);
      showToast('Unsaved changes discarded successfully', 'success');
    }
  };

  // Helper trigger to save all profile changes
  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Photo changes
      if (previewUrl === '') {
        await apiClient.delete('/profile/avatar');
      } else if (selectedFile) {
        const formData = new FormData();
        formData.append('avatar', selectedFile);
        await apiClient.postForm('/profile/avatar', formData);
      }

      // 2. Serialize Bio
      const serializedBio = serializeBio(
        personalState.bioText,
        personalState.yearsOfExperience,
        personalState.techStack,
        socialState.leetcodeUrl,
        socialState.hackerrankUrl
      );

      // 3. Save profile metadata
      const profilePayload = {
        fullName: personalState.fullName,
        username: personalState.username,
        phone: personalState.phone,
        headline: personalState.headline,
        gender: personalState.gender,
        dob: personalState.dob || null,
        country: personalState.country,
        state: personalState.state,
        city: personalState.city,
        bio: serializedBio,
        githubUrl: socialState.githubUrl,
        linkedinUrl: socialState.linkedinUrl,
        portfolioUrl: socialState.portfolioUrl,
        twitterUrl: socialState.twitterUrl,
      };

      await updateProfileMutation.mutateAsync(profilePayload);
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to preserve profile modifications', 'error');
    }
  };

  // Skeletons while fetching profile data
  if (isLoading) {
    return (
      <Container className="py-8 animate-pulse space-y-8">
        <div className="h-10 bg-secondary rounded w-1/4" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="h-96 bg-secondary rounded-xl col-span-1" />
          <div className="h-96 bg-secondary rounded-xl col-span-2" />
        </div>
      </Container>
    );
  }

  if (isError || !data) {
    return (
      <Container className="py-12 flex items-center justify-center">
        <div className="bg-card border border-destructive/20 rounded-2xl p-8 max-w-md text-center space-y-6">
          <div className="h-12 w-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-lg font-bold text-foreground">Failed to Load Profile</h3>
          <p className="text-xs text-muted-foreground">
            We couldn&apos;t connect to the backend server to resolve your developer profile coordinates.
          </p>
          <button
            onClick={() => refetch()}
            className="px-5 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Retry Connection
          </button>
        </div>
      </Container>
    );
  }

  const { profile: p, education: edus, experience: exps, skills, certifications: certs, achievements: achs, completionPercentage } = data;

  return (
    <Container className="py-6 space-y-6">
      {/* Dynamic Floating Toast List */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`p-3.5 rounded-lg border text-xs font-semibold shadow-lg flex items-center gap-2 ${
                t.type === 'success'
                  ? 'bg-card border-emerald-500/25 text-emerald-500'
                  : 'bg-card border-rose-500/25 text-rose-500'
              }`}
            >
              {t.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
              <span>{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-border/40 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Developer Identity Profile</h1>
          <p className="text-xs text-muted-foreground">Manage your credentials, professional biography, skill lists, and socials.</p>
        </div>
      </div>

      {/* Main Responsive Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT COLUMN: Sidebar Profile Identity Card */}
        <div className="space-y-6">
          <div className="bg-card border border-border/40 rounded-xl p-6 text-center space-y-4 shadow-sm relative overflow-hidden">
            {/* Completion Index Header */}
            <div className="absolute top-0 left-0 w-full h-1 bg-secondary">
              <div
                className="bg-primary h-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>

            <div className="pt-2">
              <div className="h-20 w-20 bg-primary/10 border border-primary/20 text-primary font-bold text-2xl rounded-full flex items-center justify-center mx-auto shadow overflow-hidden relative group">
                {previewUrl !== null ? (
                  previewUrl ? (
                    <img src={previewUrl} alt="avatar preview" className="h-full w-full object-cover" />
                  ) : (
                    <span>{personalState.fullName?.charAt(0).toUpperCase() || authUser?.name?.charAt(0).toUpperCase() || 'D'}</span>
                  )
                ) : personalState.avatar ? (
                  <img src={personalState.avatar} alt="avatar" className="h-full w-full object-cover" />
                ) : (
                  <span>{personalState.fullName?.charAt(0).toUpperCase() || authUser?.name?.charAt(0).toUpperCase() || 'D'}</span>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <h2 className="text-sm font-display font-bold text-foreground">{p.fullName || authUser?.name || 'Developer'}</h2>
              {p.headline ? (
                <p className="text-xs text-muted-foreground px-2">{p.headline}</p>
              ) : (
                <p className="text-[10px] text-muted-foreground italic">No professional headline added.</p>
              )}
              {p.city && (
                <span className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                  <MapPin size={10} /> {p.city}, {p.country}
                </span>
              )}
            </div>

            {/* Completion Card Display */}
            <div className="bg-secondary/25 p-3 rounded-lg border border-border/20 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-muted-foreground">Profile Completion</span>
                <span className="font-extrabold text-primary">{completionPercentage}%</span>
              </div>
              <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-1000"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>

            {/* Navigation Tabs List */}
            <div className="flex flex-col gap-1 text-left pt-4 border-t border-border/30">
              <button
                onClick={() => setActiveTab('personal')}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  activeTab === 'personal'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-secondary/40 hover:text-foreground'
                }`}
              >
                <User size={13} />
                <span>Personal Info</span>
              </button>

              <button
                onClick={() => setActiveTab('socials')}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  activeTab === 'socials'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-secondary/40 hover:text-foreground'
                }`}
              >
                <LinkIcon size={13} />
                <span>Social Links</span>
              </button>

              <button
                onClick={() => setActiveTab('education')}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  activeTab === 'education'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-secondary/40 hover:text-foreground'
                }`}
              >
                <GraduationCap size={13} />
                <span>Education Details ({edus.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('experience')}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  activeTab === 'experience'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-secondary/40 hover:text-foreground'
                }`}
              >
                <Briefcase size={13} />
                <span>Work Experience ({exps.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('skills')}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  activeTab === 'skills'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-secondary/40 hover:text-foreground'
                }`}
              >
                <Code2 size={13} />
                <span>Technical Skills ({skills.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('credentials')}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  activeTab === 'credentials'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-secondary/40 hover:text-foreground'
                }`}
              >
                <Award size={13} />
                <span>Awards & Certs ({certs.length + achs.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Form Content */}
        <div className="lg:col-span-2">
          
          {/* TAB A: Personal & Contact Forms */}
          {activeTab === 'personal' && (
            <div className="bg-card border border-border/40 rounded-xl p-6 shadow-sm space-y-6">
              {/* Unsaved Changes Banner */}
              {isAnyDirty && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-lg text-amber-500 text-xs flex items-center justify-between gap-4 select-none">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={14} />
                    <span>You have unsaved adjustments in your profile credentials.</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleCancelChanges}
                      className="px-2 py-1 hover:bg-amber-500/15 rounded text-[10px] uppercase font-bold transition-colors"
                    >
                      Discard
                    </button>
                  </div>
                </div>
              )}

              <div className="border-b border-border/20 pb-3">
                <h3 className="font-display font-semibold text-sm text-foreground">Personal & Professional Information</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">Control how your identification and career details present across boards.</p>
              </div>

              <form onSubmit={handleSaveAll} className="space-y-6">
                {/* Profile Photo Uploader Section */}
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase font-bold text-muted-foreground">Profile Photo</label>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-secondary/30 border border-border/50 overflow-hidden shrink-0 flex items-center justify-center relative">
                      {previewUrl !== null ? (
                        previewUrl ? (
                          <img src={previewUrl} alt="avatar preview" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-muted-foreground font-bold">Removed</span>
                        )
                      ) : personalState.avatar ? (
                        <img src={personalState.avatar} alt="current avatar" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-muted-foreground text-xs font-bold">No Photo</span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="cursor-pointer px-3 py-1.5 bg-secondary text-foreground text-xs font-semibold rounded-lg hover:bg-secondary/80 border border-border/40 transition-colors">
                        Choose New Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                      {(previewUrl !== '' && (personalState.avatar || previewUrl)) && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="px-3 py-1.5 bg-destructive/10 text-destructive text-xs font-semibold rounded-lg hover:bg-destructive/15 border border-destructive/20 transition-colors"
                        >
                          Remove Photo
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-[9px] text-muted-foreground">JPEG, PNG, or WEBP up to 5MB. Photo updates apply when saving profile changes.</p>
                </div>

                {/* Identity Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold text-muted-foreground">Full Name</label>
                    <input
                      type="text"
                      className="w-full bg-secondary/30 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none focus:border-primary/50"
                      value={personalState.fullName}
                      onChange={(e) => setPersonalState({ ...personalState, fullName: e.target.value })}
                      placeholder="e.g. John Doe"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold text-muted-foreground">Username</label>
                    <input
                      type="text"
                      className="w-full bg-secondary/30 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none focus:border-primary/50"
                      value={personalState.username}
                      onChange={(e) => setPersonalState({ ...personalState, username: e.target.value })}
                      placeholder="e.g. johndoe"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold text-muted-foreground">Email Address (Read-only)</label>
                    <input
                      type="email"
                      className="w-full bg-secondary/10 border border-border/30 rounded-lg p-2 text-xs text-muted-foreground cursor-not-allowed"
                      value={authUser?.email || ''}
                      readOnly
                      disabled
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold text-muted-foreground">Phone number</label>
                    <input
                      type="text"
                      className="w-full bg-secondary/30 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none focus:border-primary/50"
                      value={personalState.phone}
                      onChange={(e) => setPersonalState({ ...personalState, phone: e.target.value })}
                      placeholder="e.g. +1-234-567-890"
                    />
                  </div>
                </div>

                {/* Professional Headline and Bio */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold text-muted-foreground">Current Role / Professional Headline</label>
                    <input
                      type="text"
                      className="w-full bg-secondary/30 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none focus:border-primary/50"
                      value={personalState.headline}
                      onChange={(e) => setPersonalState({ ...personalState, headline: e.target.value })}
                      placeholder="e.g. Senior Frontend Engineer || React & TypeScript Architect"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold text-muted-foreground">Bio / Biography</label>
                    <textarea
                      rows={4}
                      className="w-full bg-secondary/30 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none focus:border-primary/50 resize-none"
                      value={personalState.bioText}
                      onChange={(e) => setPersonalState({ ...personalState, bioText: e.target.value })}
                      placeholder="Describe your goals, experience, and projects..."
                    />
                  </div>
                </div>

                {/* Location Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold text-muted-foreground">Country</label>
                    <input
                      type="text"
                      className="w-full bg-secondary/30 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none focus:border-primary/50"
                      value={personalState.country}
                      onChange={(e) => setPersonalState({ ...personalState, country: e.target.value })}
                      placeholder="e.g. United States"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold text-muted-foreground">State / Province</label>
                    <input
                      type="text"
                      className="w-full bg-secondary/30 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none focus:border-primary/50"
                      value={personalState.state}
                      onChange={(e) => setPersonalState({ ...personalState, state: e.target.value })}
                      placeholder="e.g. California"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold text-muted-foreground">City</label>
                    <input
                      type="text"
                      className="w-full bg-secondary/30 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none focus:border-primary/50"
                      value={personalState.city}
                      onChange={(e) => setPersonalState({ ...personalState, city: e.target.value })}
                      placeholder="e.g. San Francisco"
                    />
                  </div>
                </div>

                {/* Demographic optional details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold text-muted-foreground">Gender (optional)</label>
                    <select
                      className="w-full bg-secondary/30 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none focus:border-primary/50"
                      value={personalState.gender}
                      onChange={(e) => setPersonalState({ ...personalState, gender: e.target.value })}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-Binary">Non-Binary</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold text-muted-foreground">Date of Birth (optional)</label>
                    <input
                      type="date"
                      className="w-full bg-secondary/30 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none focus:border-primary/50"
                      value={personalState.dob}
                      onChange={(e) => setPersonalState({ ...personalState, dob: e.target.value })}
                    />
                  </div>
                </div>

                {/* Professional Info details */}
                <div className="border-t border-border/20 pt-4 space-y-4">
                  <h4 className="font-display font-semibold text-xs text-foreground">Professional Info Variables</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase font-bold text-muted-foreground">Years of Experience</label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        className="w-full bg-secondary/30 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none focus:border-primary/50"
                        value={personalState.yearsOfExperience}
                        onChange={(e) => setPersonalState({ ...personalState, yearsOfExperience: e.target.value })}
                        placeholder="e.g. 5"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase font-bold text-muted-foreground">Primary Tech Stack</label>
                      <input
                        type="text"
                        className="w-full bg-secondary/30 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none focus:border-primary/50"
                        value={personalState.techStack}
                        onChange={(e) => setPersonalState({ ...personalState, techStack: e.target.value })}
                        placeholder="e.g. Node.js, React, GraphQL, AWS"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Controls */}
                <div className="flex justify-end gap-3 pt-2 border-t border-border/20">
                  <button
                    type="button"
                    onClick={handleCancelChanges}
                    disabled={!isAnyDirty || updateProfileMutation.isPending}
                    className="px-4 py-2 bg-secondary text-foreground text-xs font-semibold rounded-lg hover:bg-secondary/80 border border-border/40 transition-colors disabled:opacity-50"
                  >
                    Cancel Changes
                  </button>
                  <button
                    type="submit"
                    disabled={!isAnyDirty || updateProfileMutation.isPending}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {updateProfileMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB B: Social Accounts Forms */}
          {activeTab === 'socials' && (
            <div className="bg-card border border-border/40 rounded-xl p-6 shadow-sm space-y-6">
              {/* Unsaved Changes Banner */}
              {isAnyDirty && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-lg text-amber-500 text-xs flex items-center justify-between gap-4 select-none">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={14} />
                    <span>You have unsaved adjustments in your profile credentials.</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleCancelChanges}
                      className="px-2 py-1 hover:bg-amber-500/15 rounded text-[10px] uppercase font-bold transition-colors"
                    >
                      Discard
                    </button>
                  </div>
                </div>
              )}

              <div className="border-b border-border/20 pb-3">
                <h3 className="font-display font-semibold text-sm text-foreground">Connect Social Links</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">Integrate portfolios to synchronize automation engines.</p>
              </div>

              <form onSubmit={handleSaveAll} className="space-y-4">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                      <Github size={12} /> GitHub Profile URL
                    </label>
                    <input
                      type="url"
                      className="w-full bg-secondary/30 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none focus:border-primary/50"
                      value={socialState.githubUrl}
                      onChange={(e) => setSocialState({ ...socialState, githubUrl: e.target.value })}
                      placeholder="https://github.com/username"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                      <Linkedin size={12} /> LinkedIn Profile URL
                    </label>
                    <input
                      type="url"
                      className="w-full bg-secondary/30 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none focus:border-primary/50"
                      value={socialState.linkedinUrl}
                      onChange={(e) => setSocialState({ ...socialState, linkedinUrl: e.target.value })}
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                      <Globe size={12} /> Personal Portfolio Website URL
                    </label>
                    <input
                      type="url"
                      className="w-full bg-secondary/30 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none focus:border-primary/50"
                      value={socialState.portfolioUrl}
                      onChange={(e) => setSocialState({ ...socialState, portfolioUrl: e.target.value })}
                      placeholder="https://mywebsite.com"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                      <Twitter size={12} /> Twitter / X Profile URL (optional)
                    </label>
                    <input
                      type="url"
                      className="w-full bg-secondary/30 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none focus:border-primary/50"
                      value={socialState.twitterUrl}
                      onChange={(e) => setSocialState({ ...socialState, twitterUrl: e.target.value })}
                      placeholder="https://x.com/username"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                        <Code2 size={12} /> LeetCode Profile URL
                      </label>
                      <input
                        type="url"
                        className="w-full bg-secondary/30 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none focus:border-primary/50"
                        value={socialState.leetcodeUrl}
                        onChange={(e) => setSocialState({ ...socialState, leetcodeUrl: e.target.value })}
                        placeholder="https://leetcode.com/username"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                        <Code2 size={12} /> HackerRank Profile URL
                      </label>
                      <input
                        type="url"
                        className="w-full bg-secondary/30 border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none focus:border-primary/50"
                        value={socialState.hackerrankUrl}
                        onChange={(e) => setSocialState({ ...socialState, hackerrankUrl: e.target.value })}
                        placeholder="https://hackerrank.com/username"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border/20">
                  <button
                    type="button"
                    onClick={handleCancelChanges}
                    disabled={!isAnyDirty || updateProfileMutation.isPending}
                    className="px-4 py-2 bg-secondary text-foreground text-xs font-semibold rounded-lg hover:bg-secondary/80 border border-border/40 transition-colors disabled:opacity-50"
                  >
                    Cancel Changes
                  </button>
                  <button
                    type="submit"
                    disabled={!isAnyDirty || updateProfileMutation.isPending}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {updateProfileMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB C: Education Section */}
          {activeTab === 'education' && (
            <div className="bg-card border border-border/40 rounded-xl p-6 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-border/20 pb-3">
                <div>
                  <h3 className="font-display font-semibold text-sm text-foreground">Education Chronology</h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Manage degrees, colleges, scores, and branches.</p>
                </div>
                {!eduFormOpen && (
                  <button
                    onClick={() => {
                      resetEduForm();
                      setEduFormOpen(true);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground text-[10px] font-bold uppercase rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <Plus size={10} /> Add new
                  </button>
                )}
              </div>

              {/* Add/Edit Form Box */}
              {eduFormOpen && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (eduEditId) {
                      updateEduMutation.mutate({ id: eduEditId, payload: eduState });
                    } else {
                      addEduMutation.mutate(eduState);
                    }
                  }}
                  className="bg-secondary/25 p-4 rounded-xl border border-border/30 space-y-4"
                >
                  <div className="flex justify-between items-center border-b border-border/20 pb-2">
                    <h4 className="text-xs font-bold text-foreground">
                      {eduEditId ? 'Edit Academic Entry' : 'Log New Academic Entry'}
                    </h4>
                    <button type="button" onClick={() => setEduFormOpen(false)} className="text-muted-foreground hover:text-foreground">
                      <X size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase font-bold text-muted-foreground">College / School Name</label>
                      <input
                        type="text"
                        className="w-full bg-card border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none focus:border-primary/50"
                        value={eduState.college}
                        onChange={(e) => setEduState({ ...eduState, college: e.target.value })}
                        placeholder="e.g. Stanford University"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase font-bold text-muted-foreground">Degree / Major</label>
                      <input
                        type="text"
                        className="w-full bg-card border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none focus:border-primary/50"
                        value={eduState.degree}
                        onChange={(e) => setEduState({ ...eduState, degree: e.target.value })}
                        placeholder="e.g. Bachelor of Science"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase font-bold text-muted-foreground">Branch / Specialization</label>
                      <input
                        type="text"
                        className="w-full bg-card border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none focus:border-primary/50"
                        value={eduState.branch}
                        onChange={(e) => setEduState({ ...eduState, branch: e.target.value })}
                        placeholder="e.g. Computer Science"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase font-bold text-muted-foreground">CGPA / GPA Score</label>
                      <input
                        type="text"
                        className="w-full bg-card border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none focus:border-primary/50"
                        value={eduState.cgpa}
                        onChange={(e) => setEduState({ ...eduState, cgpa: e.target.value })}
                        placeholder="e.g. 3.8/4.0 or 9.2/10"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase font-bold text-muted-foreground">Start Year</label>
                      <input
                        type="number"
                        className="w-full bg-card border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none focus:border-primary/50"
                        value={eduState.startYear}
                        onChange={(e) => setEduState({ ...eduState, startYear: parseInt(e.target.value) })}
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase font-bold text-muted-foreground">End Year (or target)</label>
                      <input
                        type="number"
                        className="w-full bg-card border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none focus:border-primary/50"
                        value={eduState.endYear || ''}
                        onChange={(e) => setEduState({ ...eduState, endYear: e.target.value ? parseInt(e.target.value) : null })}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold text-muted-foreground">Course description (optional)</label>
                    <textarea
                      rows={3}
                      className="w-full bg-card border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none focus:border-primary/50 resize-none"
                      value={eduState.description}
                      onChange={(e) => setEduState({ ...eduState, description: e.target.value })}
                      placeholder="List core courses, honors or projects..."
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEduFormOpen(false)}
                      className="px-3.5 py-1.5 text-xs border border-border/50 rounded-lg hover:bg-secondary/40 text-foreground"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={addEduMutation.isPending || updateEduMutation.isPending}
                      className="inline-flex items-center gap-1 px-4 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
                    >
                      {(addEduMutation.isPending || updateEduMutation.isPending) ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Save size={12} />
                      )}
                      <span>Save Entry</span>
                    </button>
                  </div>
                </form>
              )}

              {/* List View */}
              {edus.length === 0 ? (
                <div className="text-center py-8 bg-secondary/15 rounded-xl border border-dashed border-border/30 space-y-3">
                  <p className="text-xs text-muted-foreground">No education entries logged in your workspaces.</p>
                  <button
                    onClick={() => {
                      resetEduForm();
                      setEduFormOpen(true);
                    }}
                    className="inline-flex items-center gap-1 px-3.5 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <Plus size={12} /> Add Education details
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {edus.map((edu: any) => (
                    <div key={edu.id} className="p-4 bg-secondary/15 border border-border/30 rounded-xl flex justify-between items-start gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <GraduationCap size={15} className="text-primary" />
                          <h4 className="text-xs font-bold text-foreground">{edu.college}</h4>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {edu.degree} {edu.branch ? `• ${edu.branch}` : ''}
                        </p>
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-medium">
                          <span>
                            {edu.startYear} - {edu.endYear || 'Present'}
                          </span>
                          {edu.cgpa && (
                            <>
                              <span>•</span>
                              <span className="text-primary font-bold">GPA: {edu.cgpa}</span>
                            </>
                          )}
                        </div>
                        {edu.description && (
                          <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/10 mt-1 max-w-xl">
                            {edu.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            setEduEditId(edu.id);
                            setEduState({
                              college: edu.college,
                              degree: edu.degree,
                              branch: edu.branch || '',
                              cgpa: edu.cgpa || '',
                              startYear: edu.startYear,
                              endYear: edu.endYear,
                              description: edu.description || '',
                            });
                            setEduFormOpen(true);
                          }}
                          className="p-1.5 hover:bg-secondary/40 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this educational entry?')) {
                              deleteEduMutation.mutate(edu.id);
                            }
                          }}
                          className="p-1.5 hover:bg-secondary/40 text-muted-foreground hover:text-destructive rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB D: Experience Section */}
          {activeTab === 'experience' && (
            <div className="bg-card border border-border/40 rounded-xl p-6 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-border/20 pb-3">
                <div>
                  <h3 className="font-display font-semibold text-sm text-foreground">Professional Experience</h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Manage work experiences, internships, and types.</p>
                </div>
                {!expFormOpen && (
                  <button
                    onClick={() => {
                      resetExpForm();
                      setExpFormOpen(true);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground text-[10px] font-bold uppercase rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <Plus size={10} /> Add new
                  </button>
                )}
              </div>

              {/* Add/Edit Form Box */}
              {expFormOpen && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (expEditId) {
                      updateExpMutation.mutate({ id: expEditId, payload: expState });
                    } else {
                      addExpMutation.mutate(expState);
                    }
                  }}
                  className="bg-secondary/25 p-4 rounded-xl border border-border/30 space-y-4"
                >
                  <div className="flex justify-between items-center border-b border-border/20 pb-2">
                    <h4 className="text-xs font-bold text-foreground">
                      {expEditId ? 'Edit Work Entry' : 'Log New Work Entry'}
                    </h4>
                    <button type="button" onClick={() => setExpFormOpen(false)} className="text-muted-foreground hover:text-foreground">
                      <X size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase font-bold text-muted-foreground">Company Name</label>
                      <input
                        type="text"
                        className="w-full bg-card border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none focus:border-primary/50"
                        value={expState.company}
                        onChange={(e) => setExpState({ ...expState, company: e.target.value })}
                        placeholder="e.g. Google"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase font-bold text-muted-foreground">Position / Role Title</label>
                      <input
                        type="text"
                        className="w-full bg-card border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none focus:border-primary/50"
                        value={expState.position}
                        onChange={(e) => setExpState({ ...expState, position: e.target.value })}
                        placeholder="e.g. Software Engineer Intern"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase font-bold text-muted-foreground">Employment Type</label>
                      <select
                        className="w-full bg-card border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none focus:border-primary/50"
                        value={expState.employmentType}
                        onChange={(e) => setExpState({ ...expState, employmentType: e.target.value })}
                      >
                        <option value="Full-Time">Full-Time</option>
                        <option value="Part-Time">Part-Time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                        <option value="Freelance">Freelance</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2 pt-5">
                      <input
                        type="checkbox"
                        id="currentlyWorking"
                        className="rounded bg-card border-border/50 focus:ring-0"
                        checked={expState.currentlyWorking}
                        onChange={(e) => setExpState({ ...expState, currentlyWorking: e.target.checked })}
                      />
                      <label htmlFor="currentlyWorking" className="text-xs text-foreground font-semibold">
                        I am currently working in this role
                      </label>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase font-bold text-muted-foreground">Start Date</label>
                      <input
                        type="date"
                        className="w-full bg-card border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none focus:border-primary/50"
                        value={expState.startDate}
                        onChange={(e) => setExpState({ ...expState, startDate: e.target.value })}
                        required
                      />
                    </div>

                    {!expState.currentlyWorking && (
                      <div className="space-y-1">
                        <label className="block text-[10px] uppercase font-bold text-muted-foreground">End Date</label>
                        <input
                          type="date"
                          className="w-full bg-card border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none focus:border-primary/50"
                          value={expState.endDate}
                          onChange={(e) => setExpState({ ...expState, endDate: e.target.value })}
                          required
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold text-muted-foreground">Role description</label>
                    <textarea
                      rows={4}
                      className="w-full bg-card border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none focus:border-primary/50 resize-none"
                      value={expState.description}
                      onChange={(e) => setExpState({ ...expState, description: e.target.value })}
                      placeholder="Describe your responsibilities, architectures configured, or outcomes achieved..."
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setExpFormOpen(false)}
                      className="px-3.5 py-1.5 text-xs border border-border/50 rounded-lg hover:bg-secondary/40 text-foreground"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={addExpMutation.isPending || updateExpMutation.isPending}
                      className="inline-flex items-center gap-1 px-4 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
                    >
                      {(addExpMutation.isPending || updateExpMutation.isPending) ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Save size={12} />
                      )}
                      <span>Save Work details</span>
                    </button>
                  </div>
                </form>
              )}

              {/* List View */}
              {exps.length === 0 ? (
                <div className="text-center py-8 bg-secondary/15 rounded-xl border border-dashed border-border/30 space-y-3">
                  <p className="text-xs text-muted-foreground">No professional work logs added yet.</p>
                  <button
                    onClick={() => {
                      resetExpForm();
                      setExpFormOpen(true);
                    }}
                    className="inline-flex items-center gap-1 px-3.5 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <Plus size={12} /> Log Work Experience
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {exps.map((exp: any) => (
                    <div key={exp.id} className="p-4 bg-secondary/15 border border-border/30 rounded-xl flex justify-between items-start gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <Briefcase size={14} className="text-primary" />
                          <h4 className="text-xs font-bold text-foreground">{exp.position}</h4>
                          <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full shrink-0">
                            {exp.employmentType || 'Full-Time'}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground font-semibold">{exp.company}</p>
                        
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                          <Calendar size={10} />
                          <span>
                            {new Date(exp.startDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })} -{' '}
                            {exp.currentlyWorking
                              ? 'Present'
                              : exp.endDate
                              ? new Date(exp.endDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })
                              : ''}
                          </span>
                        </div>

                        {exp.description && (
                          <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/10 mt-1 max-w-xl">
                            {exp.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            setExpEditId(exp.id);
                            setExpState({
                              company: exp.company,
                              position: exp.position,
                              employmentType: exp.employmentType || 'Full-Time',
                              currentlyWorking: exp.currentlyWorking,
                              startDate: exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : '',
                              endDate: exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0] : '',
                              description: exp.description || '',
                            });
                            setExpFormOpen(true);
                          }}
                          className="p-1.5 hover:bg-secondary/40 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this work experience entry?')) {
                              deleteExpMutation.mutate(exp.id);
                            }
                          }}
                          className="p-1.5 hover:bg-secondary/40 text-muted-foreground hover:text-destructive rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB E: Technical Skills Section */}
          {activeTab === 'skills' && (
            <div className="bg-card border border-border/40 rounded-xl p-6 shadow-sm space-y-6">
              <div className="border-b border-border/20 pb-3">
                <h3 className="font-display font-semibold text-sm text-foreground">Categorized Skill Sets</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">Define your core stacks to synchronize ATS matching scores.</p>
              </div>

              {/* Add Skill Mini Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newSkillName.trim()) return;
                  addSkillMutation.mutate({
                    name: newSkillName.trim(),
                    category: newSkillCategory,
                    level: newSkillLevel,
                  });
                }}
                className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-secondary/20 p-3 rounded-lg border border-border/20 items-end"
              >
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-[9px] uppercase font-bold text-muted-foreground">Skill Tag Name</label>
                  <input
                    type="text"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    className="w-full bg-card border border-border/40 rounded-lg p-2 text-xs text-foreground focus:outline-none focus:border-primary/40"
                    placeholder="e.g. React, Docker, Python..."
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] uppercase font-bold text-muted-foreground">Category</label>
                  <select
                    value={newSkillCategory}
                    onChange={(e) => setNewSkillCategory(e.target.value)}
                    className="w-full bg-card border border-border/40 rounded-lg p-2 text-xs text-foreground focus:outline-none focus:border-primary/40"
                  >
                    <option value="Languages">Languages</option>
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                    <option value="Database">Database</option>
                    <option value="Cloud">Cloud</option>
                    <option value="DevOps">DevOps</option>
                    <option value="AI">AI/ML</option>
                    <option value="Tools">Tools</option>
                    <option value="Soft Skills">Soft Skills</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={addSkillMutation.isPending}
                  className="w-full bg-primary text-primary-foreground py-2 text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-1"
                >
                  {addSkillMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                  <span>Add Skill</span>
                </button>
              </form>

              {/* Grouped Skills Display */}
              {skills.length === 0 ? (
                <p className="text-xs text-muted-foreground italic text-center py-6">No tags added yet. Log skills using the banner above.</p>
              ) : (
                <div className="space-y-4">
                  {['Languages', 'Frontend', 'Backend', 'Database', 'Cloud', 'DevOps', 'AI', 'Tools', 'Soft Skills'].map((cat) => {
                    const filtered = skills.filter((s: any) => s.category === cat);
                    if (filtered.length === 0) return null;

                    return (
                      <div key={cat} className="space-y-2">
                        <span className="block text-[10px] font-bold text-primary uppercase tracking-wider">
                          {cat === 'AI' ? 'AI/ML' : cat}
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {filtered.map((sk: any) => (
                            <div
                              key={sk.id}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-secondary/45 border border-border/30 rounded-lg text-xs"
                            >
                              <span className="font-semibold text-foreground">{sk.name}</span>
                              {sk.level && <span className="text-[10px] text-muted-foreground italic">({sk.level})</span>}
                              <button
                                type="button"
                                onClick={() => deleteSkillMutation.mutate(sk.id)}
                                className="text-muted-foreground hover:text-destructive ml-1"
                              >
                                <X size={10} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB F: Certifications & Achievements CRUD */}
          {activeTab === 'credentials' && (
            <div className="space-y-6">
              
              {/* Part 1: Certifications Box */}
              <div className="bg-card border border-border/40 rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-border/20 pb-3">
                  <div>
                    <h3 className="font-display font-semibold text-sm text-foreground">Certifications</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Manage licenses and online credential coordinates.</p>
                  </div>
                  {!certFormOpen && (
                    <button
                      onClick={() => {
                        resetCertForm();
                        setCertFormOpen(true);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground text-[10px] font-bold uppercase rounded-lg hover:opacity-90"
                    >
                      <Plus size={10} /> Add new
                    </button>
                  )}
                </div>

                {certFormOpen && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (certEditId) {
                        updateCertMutation.mutate({ id: certEditId, payload: certState });
                      } else {
                        addCertMutation.mutate(certState);
                      }
                    }}
                    className="bg-secondary/25 p-4 rounded-xl border border-border/30 space-y-4"
                  >
                    <div className="flex justify-between items-center border-b border-border/20 pb-2">
                      <h4 className="text-xs font-bold text-foreground">
                        {certEditId ? 'Edit Certificate' : 'Log New Certificate'}
                      </h4>
                      <button type="button" onClick={() => setCertFormOpen(false)} className="text-muted-foreground hover:text-foreground">
                        <X size={14} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] uppercase font-bold text-muted-foreground">Certificate Title</label>
                        <input
                          type="text"
                          className="w-full bg-card border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none focus:border-primary/50"
                          value={certState.title}
                          onChange={(e) => setCertState({ ...certState, title: e.target.value })}
                          placeholder="e.g. AWS Certified Solutions Architect"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] uppercase font-bold text-muted-foreground">Issuing Organization</label>
                        <input
                          type="text"
                          className="w-full bg-card border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none focus:border-primary/50"
                          value={certState.issuer}
                          onChange={(e) => setCertState({ ...certState, issuer: e.target.value })}
                          placeholder="e.g. Amazon Web Services"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] uppercase font-bold text-muted-foreground">Issue Date</label>
                        <input
                          type="date"
                          className="w-full bg-card border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none focus:border-primary/50"
                          value={certState.issueDate}
                          onChange={(e) => setCertState({ ...certState, issueDate: e.target.value })}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] uppercase font-bold text-muted-foreground">Credential ID (optional)</label>
                        <input
                          type="text"
                          className="w-full bg-card border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none focus:border-primary/50"
                          value={certState.credentialId}
                          onChange={(e) => setCertState({ ...certState, credentialId: e.target.value })}
                          placeholder="Credential ID reference"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase font-bold text-muted-foreground">Verification URL</label>
                      <input
                        type="url"
                        className="w-full bg-card border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none focus:border-primary/50"
                        value={certState.credentialUrl}
                        onChange={(e) => setCertState({ ...certState, credentialUrl: e.target.value })}
                        placeholder="https://verify.cert.com/id"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setCertFormOpen(false)}
                        className="px-3.5 py-1.5 text-xs border border-border/50 rounded-lg hover:bg-secondary/40 text-foreground"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={addCertMutation.isPending || updateCertMutation.isPending}
                        className="inline-flex items-center gap-1 px-4 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
                      >
                        <Save size={12} />
                        <span>Save License</span>
                      </button>
                    </div>
                  </form>
                )}

                {certs.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic text-center py-4 bg-secondary/10 rounded-lg border border-dashed border-border/20">
                    No certifications added yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {certs.map((c: any) => (
                      <div key={c.id} className="p-3 bg-secondary/15 border border-border/20 rounded-lg flex justify-between items-center gap-4">
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-bold text-foreground">{c.title}</h4>
                          <span className="text-[10px] text-muted-foreground block font-semibold">{c.issuer}</span>
                          {c.issueDate && (
                            <span className="text-[9px] text-muted-foreground block">
                              Issued: {new Date(c.issueDate).toLocaleDateString()}
                            </span>
                          )}
                          {c.credentialUrl && (
                            <a
                              href={c.credentialUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-primary hover:underline flex items-center gap-0.5 pt-1"
                            >
                              <LinkIcon size={9} />
                              <span>Verify Credential</span>
                            </a>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => {
                              setCertEditId(c.id);
                              setCertState({
                                title: c.title,
                                issuer: c.issuer,
                                issueDate: c.issueDate ? new Date(c.issueDate).toISOString().split('T')[0] : '',
                                credentialId: c.credentialId || '',
                                credentialUrl: c.credentialUrl || '',
                              });
                              setCertFormOpen(true);
                            }}
                            className="p-1 hover:bg-secondary/40 text-muted-foreground hover:text-foreground rounded transition-colors"
                          >
                            <Edit2 size={11} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete certification entry?')) {
                                deleteCertMutation.mutate(c.id);
                              }
                            }}
                            className="p-1 hover:bg-secondary/40 text-muted-foreground hover:text-destructive rounded transition-colors"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Part 2: Achievements Box */}
              <div className="bg-card border border-border/40 rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-border/20 pb-3">
                  <div>
                    <h3 className="font-display font-semibold text-sm text-foreground">Honors & Achievements</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Track rank highlights, scholarships, and competitive coding.</p>
                  </div>
                  {!achFormOpen && (
                    <button
                      onClick={() => {
                        resetAchForm();
                        setAchFormOpen(true);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground text-[10px] font-bold uppercase rounded-lg hover:opacity-90"
                    >
                      <Plus size={10} /> Add new
                    </button>
                  )}
                </div>

                {achFormOpen && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (achEditId) {
                        updateAchMutation.mutate({ id: achEditId, payload: achState });
                      } else {
                        addAchMutation.mutate(achState);
                      }
                    }}
                    className="bg-secondary/25 p-4 rounded-xl border border-border/30 space-y-4"
                  >
                    <div className="flex justify-between items-center border-b border-border/20 pb-2">
                      <h4 className="text-xs font-bold text-foreground">
                        {achEditId ? 'Edit Achievement' : 'Log New Achievement'}
                      </h4>
                      <button type="button" onClick={() => setAchFormOpen(false)} className="text-muted-foreground hover:text-foreground">
                        <X size={14} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] uppercase font-bold text-muted-foreground">Achievement Title</label>
                        <input
                          type="text"
                          className="w-full bg-card border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none focus:border-primary/50"
                          value={achState.title}
                          onChange={(e) => setAchState({ ...achState, title: e.target.value })}
                          placeholder="e.g. 1st Place Hackathon, Knight at LeetCode"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] uppercase font-bold text-muted-foreground">Date of achievement</label>
                        <input
                          type="date"
                          className="w-full bg-card border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none focus:border-primary/50"
                          value={achState.date}
                          onChange={(e) => setAchState({ ...achState, date: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase font-bold text-muted-foreground">Highlight description</label>
                      <textarea
                        rows={3}
                        className="w-full bg-card border border-border/50 rounded-lg p-2 text-xs text-foreground focus:outline-none focus:border-primary/50 resize-none"
                        value={achState.description}
                        onChange={(e) => setAchState({ ...achState, description: e.target.value })}
                        placeholder="List team members, impact or numeric details..."
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setAchFormOpen(false)}
                        className="px-3.5 py-1.5 text-xs border border-border/50 rounded-lg hover:bg-secondary/40 text-foreground"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={addAchMutation.isPending || updateAchMutation.isPending}
                        className="inline-flex items-center gap-1 px-4 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
                      >
                        <Save size={12} />
                        <span>Save Achievement</span>
                      </button>
                    </div>
                  </form>
                )}

                {achs.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic text-center py-4 bg-secondary/10 rounded-lg border border-dashed border-border/20">
                    No achievements logged yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {achs.map((a: any) => (
                      <div key={a.id} className="p-3 bg-secondary/15 border border-border/20 rounded-lg flex justify-between items-center gap-4">
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-bold text-foreground">{a.title}</h4>
                          {a.date && (
                            <span className="text-[9px] text-muted-foreground block">
                              Achieved: {new Date(a.date).toLocaleDateString()}
                            </span>
                          )}
                          {a.description && <p className="text-[11px] text-muted-foreground pt-1">{a.description}</p>}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => {
                              setAchEditId(a.id);
                              setAchState({
                                title: a.title,
                                date: a.date ? new Date(a.date).toISOString().split('T')[0] : '',
                                description: a.description || '',
                              });
                              setAchFormOpen(true);
                            }}
                            className="p-1 hover:bg-secondary/40 text-muted-foreground hover:text-foreground rounded transition-colors"
                          >
                            <Edit2 size={11} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete achievement entry?')) {
                                deleteAchMutation.mutate(a.id);
                              }
                            }}
                            className="p-1 hover:bg-secondary/40 text-muted-foreground hover:text-destructive rounded transition-colors"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      </div>
    </Container>
  );
}
