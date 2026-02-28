"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { NavBar } from '@/components/NavBar';
import { adminService } from '@/services/admin';
import { Report } from '@/types';
import { Button } from '@/components/Button';

export default function AdminPage() {
    useAuth(true, true); // Require auth AND admin role

    const [activeTab, setActiveTab] = useState<'reports' | 'users'>('reports');

    // Reports state
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoadingReports, setIsLoadingReports] = useState(true);

    // Users state
    const [users, setUsers] = useState<any[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);

    // Details modal state
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [selectedUserActivities, setSelectedUserActivities] = useState<any[]>([]);
    const [isDetailsLoading, setIsDetailsLoading] = useState(false);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const data = await adminService.getReports();
                setReports(data.items || []);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoadingReports(false);
            }
        };
        fetchReports();
    }, []);

    useEffect(() => {
        if (activeTab === 'users' && users.length === 0) {
            const fetchUsers = async () => {
                setIsLoadingUsers(true);
                try {
                    const data = await adminService.getUsers(1, 50);
                    setUsers(data.items || []);
                } catch (err) {
                    console.error(err);
                } finally {
                    setIsLoadingUsers(false);
                }
            };
            fetchUsers();
        }
    }, [activeTab]);

    const handleViewUser = async (userId: string) => {
        setIsDetailsLoading(true);
        setSelectedUser(null);
        try {
            const [details, activities] = await Promise.all([
                adminService.getUserDetails(userId),
                adminService.getUserActivity(userId)
            ]);
            setSelectedUser(details);
            setSelectedUserActivities(activities.items || []);
        } catch (err) {
            console.error("Failed to load user details", err);
        } finally {
            setIsDetailsLoading(false);
        }
    };

    const handleAction = async (targetUserId: string, actionType: string, reportId?: string) => {
        try {
            await adminService.takeAction(targetUserId, actionType, "Admin review");
            if (reportId) {
                // filter out report locally
                setReports(prev => prev.filter(r => r.id !== reportId));
            }
            // Update user list if necessary
            if (actionType === 'ban' || actionType === 'unban') {
                setUsers(prev => prev.map(u => u.id === targetUserId ? { ...u, is_active: actionType === 'unban' } : u));
            }
            alert(`Action ${actionType} recorded.`);
        } catch (err) {
            alert("Failed action");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20 pt-8 flex flex-col">
            <div className="max-w-4xl mx-auto w-full px-4 mb-6">
                <h1 className="text-3xl font-serif font-bold tracking-tight text-red-600">Admin Dashboard</h1>
                <p className="text-gray-500 mt-1">Review pending reports and moderate users.</p>
            </div>

            <div className="flex-1 max-w-4xl mx-auto w-full px-4 mb-20 space-y-6">

                <div className="flex space-x-2">
                    <Button
                        variant={activeTab === 'reports' ? 'primary' : 'outline'}
                        onClick={() => setActiveTab('reports')}
                    >
                        Pending Reports
                    </Button>
                    <Button
                        variant={activeTab === 'users' ? 'primary' : 'outline'}
                        onClick={() => setActiveTab('users')}
                    >
                        User Directory
                    </Button>
                </div>

                {activeTab === 'reports' && (
                    <div className="bg-white rounded-2xl p-6 card-shadow border border-border">
                        <h2 className="text-xl font-bold mb-4 font-serif">Pending Reports</h2>

                        {isLoadingReports ? (
                            <p className="text-gray-500 text-sm">Loading reports...</p>
                        ) : reports.length === 0 ? (
                            <p className="text-green-600 text-sm font-medium">All clear! No pending reports.</p>
                        ) : (
                            <div className="space-y-4">
                                {reports.map(report => (
                                    <div key={report.id} className="p-4 border border-border rounded-xl flex justify-between items-center bg-gray-50">
                                        <div>
                                            <p className="font-semibold text-accent">Report on User <span className="font-normal text-gray-500 text-sm">{report.reported_id}</span></p>
                                            <p className="text-sm text-gray-600 mt-1"><span className="font-bold">Reason:</span> {report.reason}</p>
                                            <p className="text-xs text-gray-400 mt-2">Reported by: {report.reporter_id}</p>
                                        </div>
                                        <div className="flex space-x-2">
                                            <Button variant="outline" size="sm" onClick={() => handleAction(report.reported_id, 'dismiss', report.id)}>Dismiss</Button>
                                            <Button variant="primary" size="sm" className="bg-red-500 hover:bg-red-600 border-none" onClick={() => handleAction(report.reported_id, 'ban', report.id)}>Ban User</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="bg-white rounded-2xl p-6 card-shadow border border-border">
                        <h2 className="text-xl font-bold mb-4 font-serif">User Directory</h2>

                        {isLoadingUsers ? (
                            <p className="text-gray-500 text-sm">Loading users...</p>
                        ) : users.length === 0 ? (
                            <p className="text-gray-500 text-sm">No users found.</p>
                        ) : (
                            <div className="space-y-4">
                                {users.map(u => (
                                    <div key={u.id} className="p-4 border border-border rounded-xl flex justify-between items-center bg-gray-50">
                                        <div>
                                            <p className="font-semibold text-accent">{u.email} <span className={`text-xs px-2 py-0.5 rounded-full ${u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{u.is_active ? 'Active' : 'Banned'}</span></p>
                                            <p className="text-xs text-gray-500 mt-1">ID: {u.id}</p>
                                            <p className="text-xs text-gray-400 mt-1">Joined: {new Date(u.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex space-x-2">
                                            <Button variant="outline" size="sm" onClick={() => handleViewUser(u.id)}>View Details</Button>
                                            {u.is_active ? (
                                                <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleAction(u.id, 'ban')}>Ban</Button>
                                            ) : (
                                                <Button variant="outline" size="sm" className="text-green-600 hover:bg-green-50" onClick={() => handleAction(u.id, 'unban')}>Unban</Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* User Details Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto card-shadow">
                        <div className="p-6 border-b border-border flex justify-between items-center sticky top-0 bg-white">
                            <h2 className="text-2xl font-serif font-bold text-accent">User Details</h2>
                            <button onClick={() => setSelectedUser(null)} className="text-gray-500 hover:text-black text-xl font-bold p-2">&times;</button>
                        </div>

                        <div className="p-6 space-y-8">
                            <div>
                                <h3 className="text-lg font-bold mb-3 border-b pb-1">Account Info</h3>
                                <p className="text-sm"><span className="font-semibold w-24 inline-block">Email:</span> {selectedUser.user.email}</p>
                                <p className="text-sm mt-1"><span className="font-semibold w-24 inline-block">ID:</span> {selectedUser.user.id}</p>
                                <p className="text-sm mt-1"><span className="font-semibold w-24 inline-block">Status:</span> {selectedUser.user.is_active ? 'Active' : 'Banned'}</p>
                            </div>

                            {selectedUser.profile && (
                                <div>
                                    <h3 className="text-lg font-bold mb-3 border-b pb-1">Profile Data</h3>
                                    <p className="text-sm"><span className="font-semibold w-24 inline-block">Name:</span> {selectedUser.profile.first_name} {selectedUser.profile.last_name || ''}</p>
                                    <p className="text-sm mt-1"><span className="font-semibold w-24 inline-block">Gender:</span> {selectedUser.profile.gender}</p>
                                    <p className="text-sm mt-1"><span className="font-semibold w-24 inline-block">Seeking:</span> {selectedUser.profile.interested_in}</p>
                                    <p className="text-sm mt-1"><span className="font-semibold w-24 inline-block">Location:</span> {selectedUser.profile.latitude ? `${selectedUser.profile.latitude.toFixed(6)}, ${selectedUser.profile.longitude?.toFixed(6)}` : 'Unknown'}</p>
                                    <p className="text-sm mt-1"><span className="font-semibold w-24 inline-block">Bio:</span> {selectedUser.profile.bio || 'None'}</p>

                                    {selectedUser.profile.photos && selectedUser.profile.photos.length > 0 && (
                                        <div className="mt-4">
                                            <p className="font-semibold text-sm mb-2">Photos:</p>
                                            <div className="flex gap-2 overflow-x-auto pb-2">
                                                {selectedUser.profile.photos.map((p: any) => (
                                                    <img key={p.id} src={p.url} className="h-32 w-24 object-cover rounded-lg flex-shrink-0" alt="User photo" />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div>
                                <h3 className="text-lg font-bold mb-3 border-b pb-1">Recent Activity</h3>
                                {selectedUserActivities.length === 0 ? (
                                    <p className="text-sm text-gray-500">No recent activity found.</p>
                                ) : (
                                    <ul className="space-y-2">
                                        {selectedUserActivities.map((act: any) => (
                                            <li key={act.id} className="text-sm p-3 bg-gray-50 rounded-lg border border-gray-100 flex justify-between">
                                                <div>
                                                    <span className="font-semibold text-accent capitalize">{act.activity_type.replace('_', ' ')}</span>
                                                    {act.details && <span className="text-gray-600 block mt-0.5">{act.details}</span>}
                                                </div>
                                                <span className="text-xs text-gray-400 whitespace-nowrap ml-4">{new Date(act.created_at).toLocaleString()}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}


            <NavBar />
        </div>
    );
}
