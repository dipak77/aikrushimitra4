
import React, { useState } from 'react';
import { Language, UserProfile } from '../../types';
import SimpleView from '../layout/SimpleView';
import { Button } from '../Button';
import { UserCircle, MapPin, Ruler, Sprout, Save, User } from 'lucide-react';
import { triggerHaptic } from '../../utils/common';

const ProfileView = ({ 
    lang, 
    currentUser, 
    onSave, 
    onBack 
}: { 
    lang: Language, 
    currentUser: UserProfile, 
    onSave: (u: UserProfile) => void, 
    onBack: () => void 
}) => {
    
    // Local state for form fields
    const [name, setName] = useState(currentUser.name);
    const [village, setVillage] = useState(currentUser.village);
    const [district, setDistrict] = useState(currentUser.district);
    const [landSize, setLandSize] = useState(currentUser.landSize);
    const [crop, setCrop] = useState(currentUser.crop);

    const handleSave = () => {
        triggerHaptic();
        onSave({
            name,
            village,
            district,
            landSize,
            crop
        });
    };

    return (
        <SimpleView title="Farmer Profile" onBack={onBack}>
            <div className="pb-24 animate-enter space-y-6">
                
                {/* Avatar Section */}
                <div className="flex flex-col items-center justify-center py-6">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-cyan-500/30 rounded-full blur-xl group-hover:bg-cyan-400/50 transition-all duration-500"></div>
                        <div className="w-28 h-28 rounded-full glass-panel border border-white/20 flex items-center justify-center relative overflow-hidden z-10 shadow-2xl">
                            <UserCircle className="text-slate-200 w-full h-full p-2 opacity-80" strokeWidth={1} />
                        </div>
                        <div className="absolute bottom-0 right-0 z-20 w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center border-2 border-[#020617] shadow-lg">
                            <Save size={14} className="text-white"/>
                        </div>
                    </div>
                    <p className="mt-4 text-sm text-slate-400 font-medium">Update your farming details</p>
                </div>

                {/* Form Container */}
                <div className="glass-panel rounded-[2rem] p-6 border border-white/10 space-y-5">
                    
                    {/* Name Input */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-cyan-400 tracking-wider flex items-center gap-2">
                            <User size={14}/> Name
                        </label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-all text-lg font-medium placeholder:text-slate-600"
                            placeholder="Enter your name"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Village Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-emerald-400 tracking-wider flex items-center gap-2">
                                <MapPin size={14}/> Village
                            </label>
                            <input 
                                type="text" 
                                value={village} 
                                onChange={(e) => setVillage(e.target.value)}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium placeholder:text-slate-600"
                                placeholder="Village"
                            />
                        </div>

                        {/* District Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-emerald-400 tracking-wider">
                                District
                            </label>
                            <input 
                                type="text" 
                                value={district} 
                                onChange={(e) => setDistrict(e.target.value)}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium placeholder:text-slate-600"
                                placeholder="District"
                            />
                        </div>
                    </div>

                    {/* Land Size Input */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-amber-400 tracking-wider flex items-center gap-2">
                            <Ruler size={14}/> Land Size
                        </label>
                        <input 
                            type="text" 
                            value={landSize} 
                            onChange={(e) => setLandSize(e.target.value)}
                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-all font-medium placeholder:text-slate-600"
                            placeholder="e.g. 5 Acres"
                        />
                    </div>

                    {/* Main Crop Input */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-fuchsia-400 tracking-wider flex items-center gap-2">
                            <Sprout size={14}/> Main Crop
                        </label>
                        <input 
                            type="text" 
                            value={crop} 
                            onChange={(e) => setCrop(e.target.value)}
                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-500/50 transition-all font-medium placeholder:text-slate-600"
                            placeholder="e.g. Soyabean"
                        />
                    </div>

                </div>

                {/* Save Button */}
                <div className="pt-4">
                    <Button 
                        fullWidth 
                        size="lg" 
                        variant="primary" 
                        onClick={handleSave}
                        icon={<Save size={20}/>}
                        className="shadow-cyan-500/20"
                    >
                        Save Details
                    </Button>
                </div>

            </div>
        </SimpleView>
    );
};

export default ProfileView;
