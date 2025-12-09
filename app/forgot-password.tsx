import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import { useRouter } from 'expo-router';

// Màn hình Quên Mật khẩu
export default function ForgotPasswordScreen() {
    const router = useRouter(); 
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleResetPassword = async () => {
        if (!email) {
            Alert.alert('Lỗi', 'Vui lòng nhập email để đặt lại mật khẩu.');
            return;
        }

        // Bật loading để người dùng thấy nút thay đổi trạng thái
        setLoading(true);

        console.log('Sending password reset link to:', email);
        
        // ✨ THAY ĐỔI LỚN: Giảm setTimeout xuống 0ms để chuyển hướng gần như ngay lập tức
        setTimeout(() => {
            setLoading(false);
            
            // Chuyển thẳng đến màn hình nhập OTP
            router.push('/verify-otp'); 
        }, 0); // Độ trễ 0ms
    };

    // Hàm điều hướng quay lại Login
    const handleGoBackToLogin = () => {
        router.push('/login'); 
    };

    return (
        <View style={[styles.container, { backgroundColor: '#667eea' }]}>
            <View style={styles.keyboardView}>
                <ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={[styles.logoContainer, { backgroundColor: '#f5576c' }]}>
                            <Text style={{ fontSize: 28, color: '#FFFFFF' }}>🎬</Text>
                        </View>
                        <Text style={styles.logoText}>LiDoRa</Text>
                    </View>
                    {/* Welcome Section */}
                    <View style={styles.welcomeSection}>
                        <Text style={styles.welcomeTitle}>Forgot Password</Text>
                        <Text style={styles.welcomeSubtitle}>
                            Enter your phone number and we&apos;ll send you a link to reset your password.
                        </Text>
                    </View>

                    {/* Form Card */}
                    <View style={styles.formCard}>
                        {/* Email Input */}
                        <View style={styles.inputGroup}>
                            <View style={styles.inputLabel}>
                                <Text style={{ color: '#764ba2', marginRight: 5 }}>✉️</Text>
                                <Text style={styles.labelText}>Your Phone</Text>
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholderTextColor="#a78bfa"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                editable={!loading}
                            />
                        </View>

                        {/* Reset Password Button */}
                        <TouchableOpacity
                            style={[styles.resetButton, { backgroundColor: '#f5576c' }, loading && styles.resetButtonDisabled]}
                            onPress={handleResetPassword}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            <View style={styles.gradientButton}>
                                <Text style={styles.resetButtonText}>
                                    {loading ? '⏳ Sending...' : 'Send Reset Link'} 
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Back to Login Link */}
                    <View style={styles.backToLoginContainer}>
                        <Text style={styles.backToLoginText}>
                            {`Remember password? `}
                            <TouchableOpacity 
                                onPress={handleGoBackToLogin} 
                            >
                                <Text style={styles.backToLoginLink}>Login</Text>
                            </TouchableOpacity>
                        </Text>
                    </View>
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 50,
        justifyContent: 'center',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 25,
        paddingBottom: 50,
        justifyContent: 'center',
        minHeight: Dimensions.get('window').height,
    },
    // Header styles
    header: {
        alignItems: 'center',
        marginBottom: 50,
        marginTop: 50,
    },
    logoContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        shadowColor: '#f5576c',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    logoText: {
        fontSize: 32,
        fontWeight: '700',
        color: '#FFFFFF',
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    tagline: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 5,
    },
    // Welcome styles
    welcomeSection: {
        marginBottom: 40,
    },
    welcomeTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    welcomeSubtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        marginTop: 10,
        paddingHorizontal: 15,
    },
    // Form Card styles
    formCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 25,
        padding: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 15,
    },
    // Input styles
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    labelText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#764ba2',
        marginLeft: 8,
    },
    input: {
        height: 50,
        backgroundColor: '#f9f5ff',
        borderRadius: 12,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#4c1d95',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        paddingLeft: 15,
    },
    // Reset Button styles
    resetButton: {
        width: '100%',
        borderRadius: 15,
        marginTop: 20,
        height: 55,
    },
    resetButtonDisabled: {
        opacity: 0.6,
    },
    gradientButton: {
        width: '100%',
        height: '100%',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    resetButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    // Footer Link styles
    backToLoginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 30,
    },
    backToLoginText: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        marginRight: 5,
    },
    backToLoginLink: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#f093fb',
        textDecorationLine: 'underline',
    },
});