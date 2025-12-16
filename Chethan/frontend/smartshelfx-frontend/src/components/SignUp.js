import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Building2, Phone, MapPin, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import config from '../config';
import Roles from '../utils/roles';

const SignUp = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        company: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: Roles.MANAGER,
        phoneNumber: '',
        warehouseLocation: '',
        agreeTnC: false
    });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({
            ...formData,
            [e.target.name]: value
        });
    };

    const validateEmail = (email) => {
        return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
    };

    const validatePassword = (pwd) => {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(pwd);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (!formData.agreeTnC) {
            setError('You must agree to the terms and conditions');
            return;
        }

        if (!validateEmail(formData.email)) {
            setError('Please enter a valid email address');
            return;
        }

        if (!validatePassword(formData.password)) {
            setError('Password must be at least 8 characters, include upper and lower case letters and a number');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        const payload = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            company: formData.company,
            email: formData.email,
            password: formData.password,
            role: formData.role,
            phoneNumber: formData.phoneNumber,
            warehouseLocation: formData.warehouseLocation
        };

        setLoading(true);
        try {
            const response = await fetch(`${config.apiUrl}/users/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData);
            }

            const data = await response.json();
            setSuccessMessage(data.message || 'Registration successful!');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.message);
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

            <div className="max-w-2xl w-full space-y-8 relative z-10">
                {/* Logo and Header */}
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-2xl font-bold text-white">SX</span>
                    </div>
                    <h2 className="mt-6 text-4xl font-extrabold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                        Create Your Account
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Join SmartShelfX and revolutionize your inventory management
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
                    
                    {successMessage && (
                        <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-xl">
                            <div className="flex items-center space-x-3">
                                <CheckCircle2 className="text-emerald-600" size={20} />
                                <p className="text-sm text-emerald-700">{successMessage}</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <User size={16} className="text-teal-600" /> First Name
                                </label>
                                <input
                                    id="firstName"
                                    type="text"
                                    name="firstName"
                                    className="appearance-none relative block w-full px-4 py-3 bg-white border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                    placeholder="John"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <User size={16} className="text-teal-600" /> Last Name
                                </label>
                                <input
                                    id="lastName"
                                    type="text"
                                    name="lastName"
                                    className="appearance-none relative block w-full px-4 py-3 bg-white border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                    placeholder="Doe"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* Company */}
                        <div>
                            <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <Building2 size={16} className="text-teal-600" /> Company
                            </label>
                            <input
                                id="company"
                                type="text"
                                name="company"
                                className="appearance-none relative block w-full px-4 py-3 bg-white border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                placeholder="Your Company Name"
                                value={formData.company}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Email */}
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

                        {/* Phone */}
                        <div>
                            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <Phone size={16} className="text-teal-600" /> Phone Number
                            </label>
                            <input
                                id="phoneNumber"
                                type="tel"
                                name="phoneNumber"
                                className="appearance-none relative block w-full px-4 py-3 bg-white border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                placeholder="+1 (555) 000-0000"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Warehouse Location */}
                        <div>
                            <label htmlFor="warehouseLocation" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <MapPin size={16} className="text-teal-600" /> Warehouse Location
                            </label>
                            <input
                                id="warehouseLocation"
                                type="text"
                                name="warehouseLocation"
                                className="appearance-none relative block w-full px-4 py-3 bg-white border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                placeholder="City, State/Country"
                                value={formData.warehouseLocation}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Role */}
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                                Role
                            </label>
                            <select
                                id="role"
                                name="role"
                                className="appearance-none relative block w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                value={formData.role}
                                onChange={handleChange}
                                required
                            >
                                <option value={Roles.ADMIN}>{Roles.ADMIN}</option>
                                <option value={Roles.MANAGER}>{Roles.MANAGER}</option>
                                <option value={Roles.VENDOR}>{Roles.VENDOR}</option>
                            </select>
                        </div>

                        {/* Password Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-teal-600 transition-colors"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <Lock size={16} className="text-teal-600" /> Confirm Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        className="appearance-none relative block w-full px-4 py-3 bg-white border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all pr-12"
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-teal-600 transition-colors"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <p className="text-xs text-gray-600">
                            Password must be at least 8 characters, include upper and lower case letters and a number
                        </p>

                        {/* Terms and Conditions */}
                        <div className="flex items-start">
                            <input
                                id="agreeTnC"
                                name="agreeTnC"
                                type="checkbox"
                                className="h-4 w-4 mt-1 text-teal-600 focus:ring-teal-500 border-gray-300 rounded bg-white"
                                checked={formData.agreeTnC}
                                onChange={handleChange}
                                required
                            />
                            <label htmlFor="agreeTnC" className="ml-3 block text-sm text-gray-700">
                                I agree to the{' '}
                                <a href="#" className="text-teal-600 hover:text-teal-700 transition-colors">
                                    Terms and Conditions
                                </a>
                                {' '}and{' '}
                                <a href="#" className="text-teal-600 hover:text-teal-700 transition-colors">
                                    Privacy Policy
                                </a>
                            </label>
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
                                    <span>Creating Account...</span>
                                </>
                            ) : (
                                <>
                                    <span>Create Account</span>
                                    <ChevronRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="text-center pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <button
                                type="button"
                                className="font-medium text-teal-600 hover:text-teal-700 transition-colors"
                                onClick={() => navigate('/login')}
                            >
                                Sign in here →
                            </button>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-gray-500">
                    © 2025 SmartShelfX. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default SignUp;
