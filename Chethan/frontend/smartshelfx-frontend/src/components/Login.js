import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import config from '../config';
import Roles from '../utils/roles';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    // null = no status, true = email sent, false = email failed to send
    const [emailSentStatus, setEmailSentStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [forgotPasswordMode, setForgotPasswordMode] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        
        if (!formData.email) {
            setError('Please enter your email address');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${config.apiUrl}/users/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email: formData.email })
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData);
            }

            const data = await response.json();
            // API now returns { message, emailSent: boolean }
            const emailSent = (data && typeof data.emailSent === 'boolean') ? data.emailSent : true;
            setEmailSentStatus(emailSent);
            setSuccess(true);
            setError('');
            setTimeout(() => {
                setForgotPasswordMode(false);
                setSuccess(false);
                setEmailSentStatus(null);
                setFormData({ email: '', password: '' });
            }, 4000);
        } catch (err) {
            setError(err.message || 'Failed to reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        setLoading(true);
        // Require role selection
        if (!formData.role) {
            setLoading(false);
            setError('Please select your role before signing in');
            return;
        }
        
        try {
            const response = await fetch(`${config.apiUrl}/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData);
            }

            const data = await response.json();
            // Support both { user, token } and legacy user-only payloads
            const user = data.user || data;
            const token = data.token;

            localStorage.setItem('user', JSON.stringify(user));
            if (token) {
                localStorage.setItem('token', token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }
            setSuccess(true);
            setError('');
            setTimeout(() => {
                navigate('/dashboard');
            }, 1000);
        } catch (err) {
            setError(err.message);
            setSuccess(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Subtle background pattern */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
                <div className="absolute top-20 left-10 w-72 h-72 bg-teal-200 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-200 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-md w-full space-y-8 relative z-10">
                {/* Logo and Header */}
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-2xl font-bold text-white">SX</span>
                    </div>
                    <h2 className="mt-6 text-4xl font-extrabold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                        Welcome Back
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Sign in to access your SmartShelfX dashboard
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-gray-200">
                    {error && (
                        <div className="bg-red-50 border border-red-300 p-4 rounded-xl">
                            <div className="flex items-center space-x-3">
                                <AlertCircle className="text-red-600" size={20} />
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    )}
                    
                    {success && (
                        <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-xl">
                            <div className="flex items-center space-x-3">
                                <CheckCircle2 className="text-emerald-600" size={20} />
                                <p className="text-sm text-emerald-700">
                                    {forgotPasswordMode
                                        ? (emailSentStatus === null ? 'Password reset requested.' : (emailSentStatus ? 'Password reset email sent! Check your inbox.' : 'Password reset saved but email could not be sent. Contact admin.'))
                                        : 'Login successful! Redirecting...'}
                                </p>
                            </div>
                        </div>
                    )}

                    {!forgotPasswordMode ? (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <Mail size={16} className="text-teal-600" /> Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    className="appearance-none relative block w-full px-4 py-3 bg-white border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                    placeholder="you@company.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <Lock size={16} className="text-teal-600" /> Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        className="appearance-none relative block w-full px-4 py-3 bg-white border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all pr-12"
                                        placeholder="Enter your password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-teal-600 transition-colors"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-end">
                                <button
                                    type="button"
                                    className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
                                    onClick={() => setForgotPasswordMode(true)}
                                >
                                    Forgot password?
                                </button>
                            </div>

                            <div>
                                <label htmlFor="login-role" className="block text-sm font-medium text-gray-700 mb-2">
                                    Role
                                </label>
                                <select
                                    id="login-role"
                                    name="role"
                                    className="appearance-none relative block w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                    value={formData.role}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select your role</option>
                                    <option value={Roles.ADMIN}>{Roles.ADMIN}</option>
                                    <option value={Roles.MANAGER}>{Roles.MANAGER}</option>
                                    <option value={Roles.VENDOR}>{Roles.VENDOR}</option>
                                </select>
                            </div>

                            <button 
                                type="submit" 
                                className="w-full flex justify-center items-center gap-2 py-3 px-4 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-teal-600 to-blue-600 hover:shadow-lg hover:shadow-teal-500/30 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" 
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                        </svg>
                                        <span>Signing In...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Sign In</span>
                                        <ChevronRight size={20} />
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleForgotPassword} className="space-y-5">
                            <div>
                                <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <Mail size={16} className="text-teal-600" /> Email Address
                                </label>
                                <input
                                    id="reset-email"
                                    type="email"
                                    name="email"
                                    className="appearance-none relative block w-full px-4 py-3 bg-white border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                    placeholder="Enter your registered email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                                <p className="mt-2 text-xs text-gray-600">
                                    We'll send a new password to your email address
                                </p>
                            </div>

                            <button 
                                type="submit" 
                                className="w-full flex justify-center items-center gap-2 py-3 px-4 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-teal-600 to-blue-600 hover:shadow-lg hover:shadow-teal-500/30 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed" 
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                        </svg>
                                        <span>Sending...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Reset Password</span>
                                        <ChevronRight size={20} />
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                className="w-full py-3 px-4 border-2 border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:border-teal-600 hover:text-teal-600 transition-all"
                                onClick={() => {
                                    setForgotPasswordMode(false);
                                    setError('');
                                    setSuccess(false);
                                }}
                            >
                                ← Back to Login
                            </button>
                        </form>
                    )}

                    {!forgotPasswordMode && (
                        <div className="text-center pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-600">
                                Don't have an account?{' '}
                                <button
                                    type="button"
                                    className="font-medium text-teal-600 hover:text-teal-700 transition-colors"
                                    onClick={() => navigate('/signup')}
                                >
                                    Sign up here →
                                </button>
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-gray-500">
                    © 2025 SmartShelfX. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default Login;