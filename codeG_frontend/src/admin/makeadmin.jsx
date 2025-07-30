import React, { useEffect, useState } from "react";
import { Search, UserCheck, Plus, ShieldAlert } from "lucide-react";
import axios_client from "@/utils/axiosconfig";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AdminCreationSuccessModal from "./AdminCreationSuccessModal";
import Particles from "@/components/ui/particlebg"; // Assuming this path is correct
import CountUp from "@/components/ui/counting"; // Assuming this path is correct

const signupSchema = z.object({
    first_name: z.string().min(3, "Name must be at least 3 characters long"),
    email_id: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    role: z.enum(["user", "admin"], "Role must be either 'user' or 'admin'"),
    last_name: z.string().min(2, "Last name is required")
});

export default function ManageUsersPage() {
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(signupSchema) });
    const [newlyCreatedCredentials, setNewlyCreatedCredentials] = useState(null);
    const [isAddUserModalOpen, setAddUserModalOpen] = useState(false);
    const [roleChangeCandidate, setRoleChangeCandidate] = useState(null);

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axios_client.get("/user/alluser");
            setUsers(response.data.users || []);
        } catch (err) {
            setError(err.message || 'Failed to fetch users.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const lowercasedQuery = searchQuery.toLowerCase();
        setFilteredUsers(users.filter(user =>
            `${user.first_name}`.toLowerCase().includes(lowercasedQuery) ||
            user.email_id.toLowerCase().includes(lowercasedQuery)
        ));
    }, [searchQuery, users]);

    useEffect(() => {
        if (notification.message) {
            const timer = setTimeout(() => setNotification({ message: '', type: '' }), 4000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleRoleChange = (userId, newRole) => {
        setRoleChangeCandidate({ userId, newRole });
    };

    const handleConfirmRoleChange = async () => {
        if (!roleChangeCandidate) return;
        try {
            await axios_client.put(`/user/updateRole/${roleChangeCandidate.userId}`, { role: roleChangeCandidate.newRole });
            setUsers(prev => prev.map(user => user._id === roleChangeCandidate.userId ? { ...user, role: roleChangeCandidate.newRole } : user));
            setNotification({ message: `User role updated successfully.`, type: 'success' });
        } catch (err) {
            setNotification({ message: err.response?.data?.message || 'Failed to update role.', type: 'error' });
        } finally {
            setRoleChangeCandidate(null);
        }
    };

    const closeAddUserModal = () => {
        setAddUserModalOpen(false);
        reset();
    };

    const onCreateUserSubmit = async (data) => {
        try {
            const response = await axios_client.post("user/register/admin", data);
            fetchUsers();
            const { Email, Password } = response.data.reply;
            setNewlyCreatedCredentials({ email: Email, password: Password });
            closeAddUserModal();
        } catch (err) {
            setNotification({ message: err.response?.data?.message || 'Failed to create user.', type: 'error' });
        }
    };

    const RoleBadge = ({ role }) => (
        <div className={`badge ${role?.toLowerCase() === 'admin' ? 'badge-primary' : 'badge-ghost'}`}>{role}</div>
    );

    const renderContent = () => {
        if (isLoading) return <div className="flex justify-center p-16"><span className="loading loading-spinner loading-lg text-primary"></span></div>;
        if (error) return <div className="alert alert-error"><span>{error}</span></div>;
        if (users.length > 0 && filteredUsers.length === 0) return <div className="text-center py-16"><h3 className="text-xl font-semibold">No users match your search.</h3></div>;
        if (filteredUsers.length === 0) return <div className="text-center py-16"><h3 className="text-xl font-semibold">No users found.</h3></div>;

        return (
            <div className="overflow-x-auto">
                <table className="table w-full">
                    <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined On</th><th className="text-center">Set Role</th></tr></thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user._id} className="hover">
                                <td><div className="font-bold">{user.first_name}</div></td>
                                <td>{user.email_id}</td>
                                <td><RoleBadge role={user.role} /></td>
                                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td className="text-center">
                                    <select className="select select-bordered select-sm" value={user.role} onChange={(e) => handleRoleChange(user._id, e.target.value)}>
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200 p-4 sm:p-6">
            <div className="absolute inset-0 z-0 pointer-events-none">
                <Particles
                    particleColors={['#ffffff', '#ffffff']}
                    particleCount={180}
                    particleSpread={10}
                    speed={0.1}
                    particleBaseSize={100}
                    moveParticlesOnHover={true}
                    alphaParticles={false}
                    disableRotation={false}
                    className="absolute inset-0 w-full h-full"
                />
            </div>
            <div className="max-w-7xl mx-auto">
                <div className="rounded-2xl p-8 mb-10 shadow-xl bg-base-100/80 backdrop-blur-md border border-base-300">
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-bold text-info"><UserCheck className="inline-block w-10 h-10 mr-2" />User Management</h1>
                        <p className="text-base-content/70">View, create, and manage user roles and platform access.</p>
                        <div className="mt-6 inline-block bg-white dark:bg-zinc-900 px-6 py-4 rounded-xl shadow border border-info/30">
                            <div className="text-sm text-muted-foreground font-medium">Total Users</div>
                            <div className="text-3xl font-bold text-info mt-1">{  <CountUp
                                                        from={0}
                                                        to={users.length}
                                                        separator=","
                                                        direction="up"
                                                        duration={2}
                                                        className="count-up-text"
                                                    />}</div>
                        </div>
                    </div>
                </div>

                <div className="card bg-base-100/70 backdrop-blur-lg shadow-xl border border-base-300">
                    <div className="card-body">
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
                            <div className="form-control w-full md:max-w-md">
                                <div className="relative w-full">
                                    <Search size={18} className="absolute z-10 left-4 top-1/2 -translate-y-1/2 text-base-content/50" />
                                    <input type="text" placeholder="Search by name or email..." className="input input-bordered w-full pl-12 rounded-full" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                                </div>
                            </div>
                            <button className="btn btn-primary gap-2" onClick={() => setAddUserModalOpen(true)}><Plus /> Add New User</button>
                        </div>
                        {renderContent()}
                    </div>
                </div>
            </div>

            {notification.message && <div className="toast toast-top toast-center min-w-max z-50"><div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'}`}><span>{notification.message}</span></div></div>}

            <input type="checkbox" id="add-user-modal" className="modal-toggle" checked={isAddUserModalOpen} readOnly />
            <div className="modal">
                <div className="modal-box">
                    <button type="button" className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={closeAddUserModal}>✕</button>
                    <h3 className="font-bold text-lg mb-4">Create New User</h3>
                    <form onSubmit={handleSubmit(onCreateUserSubmit)} className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <input type="text" placeholder="First Name" className={`input input-bordered w-full ${errors.first_name ? 'input-error' : ''}`} {...register("first_name")} />
                                {errors.first_name && <p className="text-error text-xs mt-1">{errors.first_name.message}</p>}
                            </div>
                            <div>
                                <input type="text" placeholder="Last Name" className={`input input-bordered w-full ${errors.last_name ? 'input-error' : ''}`} {...register("last_name")} />
                                {errors.last_name && <p className="text-error text-xs mt-1">{errors.last_name.message}</p>}
                            </div>
                        </div>
                        <div>
                            <input type="email" placeholder="Email Address" className={`input input-bordered w-full ${errors.email_id ? 'input-error' : ''}`} {...register("email_id")} />
                            {errors.email_id && <p className="text-error text-xs mt-1">{errors.email_id.message}</p>}
                        </div>
                        <div>
                            <input type="password" placeholder="Password" className={`input input-bordered w-full ${errors.password ? 'input-error' : ''}`} {...register("password")} />
                            {errors.password && <p className="text-error text-xs mt-1">{errors.password.message}</p>}
                        </div>
                        <select className="select select-bordered w-full" {...register("role")}> <option value="user">User</option><option value="admin">Admin</option></select>
                        <div className="modal-action pt-2">
                            <button type="button" className="btn" onClick={closeAddUserModal}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>{isSubmitting ? <><span className="loading loading-spinner"></span>Creating...</> : 'Create'}</button>
                        </div>
                    </form>
                </div>
            </div>

            <input type="checkbox" id="role-change-modal" className="modal-toggle" checked={!!roleChangeCandidate} readOnly />
            <div className="modal">
                <div className="modal-box">
                    <ShieldAlert className="w-16 h-16 text-warning mx-auto mb-4" />
                    <h3 className="font-bold text-lg text-center">Confirm Role Change</h3>
                    <p className="py-4 text-center">Are you sure you want to change this user's role to <strong className="badge badge-lg badge-primary">{roleChangeCandidate?.newRole}</strong>?</p>
                    <div className="modal-action justify-center gap-4">
                        <button className="btn" onClick={() => setRoleChangeCandidate(null)}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleConfirmRoleChange}>Confirm</button>
                    </div>
                </div>
            </div>

            {newlyCreatedCredentials && <AdminCreationSuccessModal credentials={newlyCreatedCredentials} onClose={() => setNewlyCreatedCredentials(null)} />}
        </div>
    );
}
