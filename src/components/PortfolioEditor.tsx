import React, { useState } from 'react';
import { ResumeData, ExperienceItem, ProjectItem, EducationItem, SkillCategory } from '../types';
import { Save, Plus, Trash2, Code, Layout, ArrowLeft, AlertCircle } from 'lucide-react';

interface PortfolioEditorProps {
  data: ResumeData;
  onSave: (updatedData: ResumeData) => void;
  onCancel: () => void;
}

export const PortfolioEditor: React.FC<PortfolioEditorProps> = ({
  data,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState<ResumeData>(JSON.parse(JSON.stringify(data)));
  const [activeTab, setActiveTab] = useState<'visual' | 'raw_json'>('visual');
  const [jsonText, setJsonText] = useState<string>(JSON.stringify(data, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);
  
  // Quick adds
  const [newSkillCategory, setNewSkillCategory] = useState('Core Competencies');
  const [newSkillItem, setNewSkillItem] = useState('');
  const [newCertification, setNewCertification] = useState('');
  const [newAchievement, setNewAchievement] = useState('');

  // Handle visual edits
  const handleTextChange = (field: keyof ResumeData, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    setJsonText(JSON.stringify(updated, null, 2));
  };

  const handleContactChange = (field: string, value: string) => {
    const updated = {
      ...formData,
      contact: {
        ...formData.contact,
        [field]: value
      }
    };
    setFormData(updated);
    setJsonText(JSON.stringify(updated, null, 2));
  };

  // Helper for skill items
  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillItem.trim()) return;

    const currentSkills = [...(formData.skills || [])];
    const categoryName = newSkillCategory.trim() || 'General';

    // Find if category already exists
    let found = false;
    const updatedSkills = currentSkills.map(s => {
      if (typeof s === 'object' && s.category?.toLowerCase() === categoryName.toLowerCase()) {
        found = true;
        return {
          ...s,
          items: Array.from(new Set([...(s.items || []), newSkillItem.trim()]))
        };
      }
      return s;
    });

    if (!found) {
      updatedSkills.push({
        category: categoryName,
        items: [newSkillItem.trim()]
      });
    }

    const updated = { ...formData, skills: updatedSkills };
    setFormData(updated);
    setJsonText(JSON.stringify(updated, null, 2));
    setNewSkillItem('');
  };

  const handleRemoveSkillItem = (catIndex: number, itemIndex: number) => {
    const currentSkills = [...(formData.skills || [])];
    const target = currentSkills[catIndex];

    if (typeof target === 'string') {
      currentSkills.splice(catIndex, 1);
    } else if (target && typeof target === 'object') {
      const remaining = (target.items || []).filter((_, i) => i !== itemIndex);
      if (remaining.length === 0) {
        currentSkills.splice(catIndex, 1);
      } else {
        currentSkills[catIndex] = { ...target, items: remaining };
      }
    }

    const updated = { ...formData, skills: currentSkills };
    setFormData(updated);
    setJsonText(JSON.stringify(updated, null, 2));
  };

  // Certifications handlers
  const handleAddCertification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCertification.trim()) return;
    const updated = {
      ...formData,
      certifications: [...(formData.certifications || []), newCertification.trim()]
    };
    setFormData(updated);
    setJsonText(JSON.stringify(updated, null, 2));
    setNewCertification('');
  };

  const handleRemoveCertification = (index: number) => {
    const updated = {
      ...formData,
      certifications: (formData.certifications || []).filter((_, i) => i !== index)
    };
    setFormData(updated);
    setJsonText(JSON.stringify(updated, null, 2));
  };

  // Achievements handlers
  const handleAddAchievement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAchievement.trim()) return;
    const updated = {
      ...formData,
      achievements: [...(formData.achievements || []), newAchievement.trim()]
    };
    setFormData(updated);
    setJsonText(JSON.stringify(updated, null, 2));
    setNewAchievement('');
  };

  const handleRemoveAchievement = (index: number) => {
    const updated = {
      ...formData,
      achievements: (formData.achievements || []).filter((_, i) => i !== index)
    };
    setFormData(updated);
    setJsonText(JSON.stringify(updated, null, 2));
  };

  // Experience handlers
  const handleAddExperience = () => {
    const newExp: ExperienceItem = {
      role: 'Role Title',
      company: 'Company Name',
      duration: '2023 – Present',
      details: ['Led key initiatives delivering measurable impact and positive results.']
    };
    const updated = { ...formData, experience: [...(formData.experience || []), newExp] };
    setFormData(updated);
    setJsonText(JSON.stringify(updated, null, 2));
  };

  const handleRemoveExperience = (index: number) => {
    const updated = {
      ...formData,
      experience: formData.experience.filter((_, i) => i !== index)
    };
    setFormData(updated);
    setJsonText(JSON.stringify(updated, null, 2));
  };

  // Project handlers
  const handleAddProject = () => {
    const newProj: ProjectItem = {
      title: 'Featured Project',
      description: 'Engineered a modern application with high performance and accessibility.',
      technologies: ['TypeScript', 'React', 'Tailwind']
    };
    const updated = { ...formData, projects: [...(formData.projects || []), newProj] };
    setFormData(updated);
    setJsonText(JSON.stringify(updated, null, 2));
  };

  const handleRemoveProject = (index: number) => {
    const updated = {
      ...formData,
      projects: formData.projects.filter((_, i) => i !== index)
    };
    setFormData(updated);
    setJsonText(JSON.stringify(updated, null, 2));
  };

  // Education handlers
  const handleAddEducation = () => {
    const newEdu: EducationItem = {
      degree: 'B.S. in Computer Science',
      institution: 'University Name',
      year: '2020 – 2024'
    };
    const updated = { ...formData, education: [...(formData.education || []), newEdu] };
    setFormData(updated);
    setJsonText(JSON.stringify(updated, null, 2));
  };

  const handleRemoveEducation = (index: number) => {
    const updated = {
      ...formData,
      education: (formData.education || []).filter((_, i) => i !== index)
    };
    setFormData(updated);
    setJsonText(JSON.stringify(updated, null, 2));
  };

  // Save changes
  const handleSubmit = () => {
    if (activeTab === 'raw_json') {
      try {
        const parsed = JSON.parse(jsonText);
        setJsonError(null);
        onSave(parsed);
      } catch (err: any) {
        setJsonError(`Invalid JSON format: ${err.message}`);
      }
    } else {
      onSave(formData);
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Editor Header */}
      <div className="bg-white border border-[#E5ECE8] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-xl border border-[#E5ECE8] text-[#4B5563] hover:text-[#111111] hover:bg-[#F8FAF9] transition-colors"
            title="Back to Preview"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="font-serif text-base sm:text-lg font-bold text-[#111111] leading-tight">
              Customize Portfolio Content
            </h2>
            <p className="text-xs text-[#8A9691]">
              Edit visual fields or update the underlying JSON structure directly
            </p>
          </div>
        </div>

        {/* Tab switch & Actions */}
        <div className="flex items-center gap-2.5">
          <div className="inline-flex p-1 rounded-xl bg-[#F8FAF9] border border-[#E5ECE8]">
            <button
              id="tab-editor-visual"
              type="button"
              onClick={() => setActiveTab('visual')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'visual'
                  ? 'bg-white text-[#087A5B] shadow-2xs'
                  : 'text-[#4B5563] hover:text-[#111111]'
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              <span>Form Fields</span>
            </button>
            <button
              id="tab-editor-json"
              type="button"
              onClick={() => setActiveTab('raw_json')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'raw_json'
                  ? 'bg-white text-[#087A5B] shadow-2xs'
                  : 'text-[#4B5563] hover:text-[#111111]'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Raw JSON</span>
            </button>
          </div>

          <button
            id="btn-editor-save"
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 rounded-xl bg-[#087A5B] hover:bg-[#065842] text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 active:scale-[0.98]"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Update Portfolio</span>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      {activeTab === 'raw_json' ? (
        <div className="bg-white border border-[#E5ECE8] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          {jsonError && (
            <div className="p-3.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{jsonError}</span>
            </div>
          )}
          <textarea
            id="editor-json-textarea"
            rows={24}
            value={jsonText}
            onChange={(e) => {
              setJsonText(e.target.value);
              try {
                const p = JSON.parse(e.target.value);
                setFormData(p);
                setJsonError(null);
              } catch (err) {
                // Keep editing
              }
            }}
            className="w-full font-mono text-xs p-4 rounded-xl border border-[#E5ECE8] bg-[#111111] text-[#E5ECE8] focus:outline-none focus:ring-2 focus:ring-[#087A5B] leading-relaxed"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* Column 1: Core Personal & Contact Details */}
          <div className="space-y-4">
            
            {/* Primary Details */}
            <div className="bg-white border border-[#E5ECE8] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
              <h3 className="font-serif font-bold text-sm text-[#111111] border-b border-[#E5ECE8] pb-2">
                Personal & Headline
              </h3>
              
              <div>
                <label className="block text-xs font-semibold text-[#111111] mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => handleTextChange('name', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E5ECE8] bg-[#F8FAF9] text-xs sm:text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#087A5B] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111111] mb-1">Professional Title / Headline</label>
                <input
                  type="text"
                  value={formData.headline || ''}
                  onChange={(e) => handleTextChange('headline', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E5ECE8] bg-[#F8FAF9] text-xs sm:text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#087A5B] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111111] mb-1">Professional Summary</label>
                <textarea
                  rows={4}
                  value={formData.summary || ''}
                  onChange={(e) => handleTextChange('summary', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E5ECE8] bg-[#F8FAF9] text-xs sm:text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#087A5B] focus:bg-white leading-relaxed"
                />
              </div>
            </div>

            {/* Contact Details */}
            <div className="bg-white border border-[#E5ECE8] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
              <h3 className="font-serif font-bold text-sm text-[#111111] border-b border-[#E5ECE8] pb-2">
                Contact & Links
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.contact?.email || ''}
                    onChange={(e) => handleContactChange('email', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E5ECE8] bg-[#F8FAF9] text-xs text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#087A5B] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. San Francisco, CA"
                    value={formData.contact?.location || ''}
                    onChange={(e) => handleContactChange('location', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E5ECE8] bg-[#F8FAF9] text-xs text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#087A5B] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.contact?.phone || ''}
                    onChange={(e) => handleContactChange('phone', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E5ECE8] bg-[#F8FAF9] text-xs text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#087A5B] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1">LinkedIn</label>
                  <input
                    type="text"
                    value={formData.contact?.linkedin || ''}
                    onChange={(e) => handleContactChange('linkedin', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E5ECE8] bg-[#F8FAF9] text-xs text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#087A5B] focus:bg-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#111111] mb-1">GitHub / Portfolio URL</label>
                  <input
                    type="text"
                    value={formData.contact?.github || ''}
                    onChange={(e) => handleContactChange('github', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E5ECE8] bg-[#F8FAF9] text-xs text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#087A5B] focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Categorized Skills */}
            <div className="bg-white border border-[#E5ECE8] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
              <h3 className="font-serif font-bold text-sm text-[#111111] border-b border-[#E5ECE8] pb-2">
                Categorized Skills
              </h3>
              
              <div className="space-y-3">
                {(formData.skills || []).map((skillGroup, catIdx) => {
                  if (typeof skillGroup === 'string') {
                    return (
                      <span
                        key={catIdx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#EBF5F1] border border-[#087A5B]/20 text-[#087A5B] mr-1 mb-1"
                      >
                        <span>{skillGroup}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkillItem(catIdx, 0)}
                          className="text-[#8A9691] hover:text-red-500 font-bold"
                          title="Remove"
                        >
                          ×
                        </button>
                      </span>
                    );
                  }

                  const group = skillGroup as SkillCategory;
                  return (
                    <div key={catIdx} className="p-3 bg-[#F8FAF9] rounded-xl border border-[#E5ECE8] space-y-1.5">
                      <div className="text-xs font-bold text-[#087A5B] uppercase tracking-wider">
                        {group.category || 'Skills'}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(group.items || []).map((item, itemIdx) => (
                          <span
                            key={itemIdx}
                            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white border border-[#E5ECE8] text-[#111111]"
                          >
                            <span>{item}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSkillItem(catIdx, itemIdx)}
                              className="text-[#8A9691] hover:text-red-500 font-bold"
                              title="Remove"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={handleAddSkill} className="flex flex-col sm:flex-row gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Category (e.g. Languages)..."
                  value={newSkillCategory}
                  onChange={(e) => setNewSkillCategory(e.target.value)}
                  className="sm:w-1/3 p-2 rounded-xl border border-[#E5ECE8] bg-[#F8FAF9] text-xs text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#087A5B] focus:bg-white"
                />
                <input
                  type="text"
                  placeholder="Skill (e.g. TypeScript)..."
                  value={newSkillItem}
                  onChange={(e) => setNewSkillItem(e.target.value)}
                  className="flex-1 p-2 rounded-xl border border-[#E5ECE8] bg-[#F8FAF9] text-xs text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#087A5B] focus:bg-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#087A5B] text-white text-xs font-semibold rounded-xl hover:bg-[#065842] transition-colors"
                >
                  Add
                </button>
              </form>
            </div>

            {/* Education List */}
            <div className="bg-white border border-[#E5ECE8] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between border-b border-[#E5ECE8] pb-2">
                <h3 className="font-serif font-bold text-sm text-[#111111]">
                  Education ({formData.education?.length || 0})
                </h3>
                <button
                  type="button"
                  onClick={handleAddEducation}
                  className="text-xs font-semibold text-[#087A5B] hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Degree
                </button>
              </div>

              <div className="space-y-2.5">
                {(formData.education || []).map((edu, idx) => (
                  <div key={idx} className="p-3 bg-[#F8FAF9] rounded-xl border border-[#E5ECE8] space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={edu.degree}
                        placeholder="Degree / Certificate"
                        onChange={(e) => {
                          const edus = [...(formData.education || [])];
                          edus[idx].degree = e.target.value;
                          handleTextChange('education', edus);
                        }}
                        className="font-bold text-xs bg-white border border-[#E5ECE8] rounded-lg p-1.5 flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveEducation(idx)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={edu.institution}
                        placeholder="Institution"
                        onChange={(e) => {
                          const edus = [...(formData.education || [])];
                          edus[idx].institution = e.target.value;
                          handleTextChange('education', edus);
                        }}
                        className="text-xs bg-white border border-[#E5ECE8] rounded-lg p-1.5"
                      />
                      <input
                        type="text"
                        value={edu.year || ''}
                        placeholder="Year"
                        onChange={(e) => {
                          const edus = [...(formData.education || [])];
                          edus[idx].year = e.target.value;
                          handleTextChange('education', edus);
                        }}
                        className="text-xs bg-white border border-[#E5ECE8] rounded-lg p-1.5"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Column 2: Experience, Projects, Certifications, Achievements */}
          <div className="space-y-4">
            
            {/* Experience List */}
            <div className="bg-white border border-[#E5ECE8] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between border-b border-[#E5ECE8] pb-2">
                <h3 className="font-serif font-bold text-sm text-[#111111]">
                  Work Experience ({formData.experience?.length || 0})
                </h3>
                <button
                  type="button"
                  onClick={handleAddExperience}
                  className="text-xs font-semibold text-[#087A5B] hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Position
                </button>
              </div>

              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {(formData.experience || []).map((exp, idx) => (
                  <div key={idx} className="p-3 bg-[#F8FAF9] rounded-xl border border-[#E5ECE8] space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={exp.role}
                        placeholder="Role Title"
                        onChange={(e) => {
                          const exps = [...formData.experience];
                          exps[idx].role = e.target.value;
                          handleTextChange('experience', exps);
                        }}
                        className="font-bold text-xs bg-white border border-[#E5ECE8] rounded-lg p-1.5 flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExperience(idx)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Delete Role"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={exp.company}
                        placeholder="Company"
                        onChange={(e) => {
                          const exps = [...formData.experience];
                          exps[idx].company = e.target.value;
                          handleTextChange('experience', exps);
                        }}
                        className="text-xs bg-white border border-[#E5ECE8] rounded-lg p-1.5"
                      />
                      <input
                        type="text"
                        value={exp.duration}
                        placeholder="Duration"
                        onChange={(e) => {
                          const exps = [...formData.experience];
                          exps[idx].duration = e.target.value;
                          handleTextChange('experience', exps);
                        }}
                        className="text-xs bg-white border border-[#E5ECE8] rounded-lg p-1.5"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Projects List */}
            <div className="bg-white border border-[#E5ECE8] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between border-b border-[#E5ECE8] pb-2">
                <h3 className="font-serif font-bold text-sm text-[#111111]">
                  Featured Projects ({formData.projects?.length || 0})
                </h3>
                <button
                  type="button"
                  onClick={handleAddProject}
                  className="text-xs font-semibold text-[#087A5B] hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Project
                </button>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {(formData.projects || []).map((proj, idx) => (
                  <div key={idx} className="p-3 bg-[#F8FAF9] rounded-xl border border-[#E5ECE8] space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={proj.title}
                        placeholder="Project Title"
                        onChange={(e) => {
                          const projs = [...formData.projects];
                          projs[idx].title = e.target.value;
                          handleTextChange('projects', projs);
                        }}
                        className="font-bold text-xs bg-white border border-[#E5ECE8] rounded-lg p-1.5 flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveProject(idx)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Delete Project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={proj.description}
                      placeholder="Description"
                      onChange={(e) => {
                        const projs = [...formData.projects];
                        projs[idx].description = e.target.value;
                        handleTextChange('projects', projs);
                      }}
                      className="w-full text-xs bg-white border border-[#E5ECE8] rounded-lg p-1.5"
                    />
                    <input
                      type="text"
                      placeholder="Tech tags (comma separated: React, TypeScript, GraphQL)"
                      value={(proj.technologies || []).join(', ')}
                      onChange={(e) => {
                        const projs = [...formData.projects];
                        projs[idx].technologies = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                        handleTextChange('projects', projs);
                      }}
                      className="w-full text-xs bg-white border border-[#E5ECE8] rounded-lg p-1.5 font-mono"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications Callouts */}
            <div className="bg-white border border-[#E5ECE8] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
              <h3 className="font-serif font-bold text-sm text-[#111111] border-b border-[#E5ECE8] pb-2">
                Certifications &amp; Courses ({formData.certifications?.length || 0})
              </h3>
              <div className="space-y-1.5">
                {(formData.certifications || []).map((cert, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-[#F8FAF9] border border-[#E5ECE8] text-xs">
                    <span>📜 {cert}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCertification(idx)}
                      className="text-[#8A9691] hover:text-red-500 ml-2"
                      title="Remove"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <form onSubmit={handleAddCertification} className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Add certification (e.g. AWS Certified Developer)..."
                  value={newCertification}
                  onChange={(e) => setNewCertification(e.target.value)}
                  className="flex-1 p-2.5 rounded-xl border border-[#E5ECE8] bg-[#F8FAF9] text-xs text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#087A5B] focus:bg-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-[#087A5B] text-white text-xs font-semibold rounded-xl hover:bg-[#065842] transition-colors"
                >
                  Add
                </button>
              </form>
            </div>

            {/* Achievements Callouts */}
            <div className="bg-white border border-[#E5ECE8] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
              <h3 className="font-serif font-bold text-sm text-[#111111] border-b border-[#E5ECE8] pb-2">
                Key Achievements &amp; Awards ({formData.achievements?.length || 0})
              </h3>
              <div className="space-y-1.5">
                {(formData.achievements || []).map((ach, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-[#F8FAF9] border border-[#E5ECE8] text-xs">
                    <span>🏆 {ach}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAchievement(idx)}
                      className="text-[#8A9691] hover:text-red-500 ml-2"
                      title="Remove"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <form onSubmit={handleAddAchievement} className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Add competition/hackathon award..."
                  value={newAchievement}
                  onChange={(e) => setNewAchievement(e.target.value)}
                  className="flex-1 p-2.5 rounded-xl border border-[#E5ECE8] bg-[#F8FAF9] text-xs text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#087A5B] focus:bg-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-[#087A5B] text-white text-xs font-semibold rounded-xl hover:bg-[#065842] transition-colors"
                >
                  Add
                </button>
              </form>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
