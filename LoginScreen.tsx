import React, { useState } from 'react'
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, StatusBar,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import * as WebBrowser from 'expo-web-browser'
import { makeRedirectUri } from 'expo-auth-session'
import { supabase } from '../../lib/supabase'
import { GoldButton } from '../../components/ui/GoldButton'
import { colors } from '../../theme/colors'
import { typography } from '../../theme/typography'
import { radius, layout } from '../../theme/spacing'

WebBrowser.maybeCompleteAuthSession()

export function LoginScreen() {
  const navigation = useNavigation<any>()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleEmailLogin = async () => {
    if (!email || !password) return
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (err) {
      setError(err.message)
    } else {
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] })
    }
  }

  const handleGoogleLogin = async () => {
    const redirectUri = makeRedirectUri({ scheme: 'savorblk' })
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: redirectUri },
    })
    if (data?.url) {
      await WebBrowser.openAuthSessionAsync(data.url, redirectUri)
    }
  }

  const handleAppleLogin = async () => {
    const redirectUri = makeRedirectUri({ scheme: 'savorblk' })
    const { data } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: redirectUri },
    })
    if (data?.url) {
      await WebBrowser.openAuthSessionAsync(data.url, redirectUri)
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView edges={['top']}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={colors.foreground} />
        </TouchableOpacity>
      </SafeAreaView>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {/* Logo */}
          <View style={styles.logoSection}>
            <Text style={styles.logo}>SavorBLK</Text>
            <Text style={styles.tagline}>Welcome back</Text>
          </View>

          {/* OAuth buttons */}
          <TouchableOpacity style={styles.oauthBtn} onPress={handleGoogleLogin}>
            <Ionicons name="logo-google" size={20} color={colors.foreground} />
            <Text style={styles.oauthText}>Continue with Google</Text>
          </TouchableOpacity>

          {Platform.OS === 'ios' && (
            <TouchableOpacity style={[styles.oauthBtn, styles.appleBtn]} onPress={handleAppleLogin}>
              <Ionicons name="logo-apple" size={20} color="#000" />
              <Text style={[styles.oauthText, { color: '#000' }]}>Continue with Apple</Text>
            </TouchableOpacity>
          )}

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or sign in with email</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Email / password */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@email.com"
              placeholderTextColor={colors.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              color={colors.foreground}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={colors.muted}
                secureTextEntry={!showPassword}
                color={colors.foreground}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword((s) => !s)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.muted}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.forgotLink}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <GoldButton
            label="Sign In"
            onPress={handleEmailLogin}
            loading={loading}
            disabled={!email || !password}
            fullWidth
            style={styles.signInBtn}
          />

          <View style={styles.signupRow}>
            <Text style={styles.signupText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signupLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  backBtn: { padding: layout.screenPaddingH },
  body: { padding: layout.screenPaddingH, paddingTop: 0, gap: 16 },
  logoSection: { alignItems: 'center', paddingVertical: 24, gap: 6 },
  logo: { ...typography.displayLG, color: colors.primary },
  tagline: { ...typography.bodyMD, color: colors.muted },
  oauthBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 12, height: 52, borderRadius: radius.lg,
    backgroundColor: colors.secondary, borderWidth: 1, borderColor: colors.border,
  },
  appleBtn: { backgroundColor: '#ffffff' },
  oauthText: { ...typography.buttonMD, color: colors.foreground },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { ...typography.labelSM, color: colors.muted },
  field: { gap: 6 },
  fieldLabel: { ...typography.labelSM, color: colors.muted },
  input: {
    ...typography.bodyMD, height: 52, borderRadius: radius.lg,
    paddingHorizontal: 16, backgroundColor: colors.secondary,
    borderWidth: 1, borderColor: colors.border,
  },
  passwordRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  eyeBtn: { padding: 12, backgroundColor: colors.secondary, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  forgotLink: { alignSelf: 'flex-end' },
  forgotText: { ...typography.labelSM, color: colors.primary },
  error: { ...typography.bodyMD, color: colors.destructive, textAlign: 'center' },
  signInBtn: { marginTop: 8 },
  signupRow: { flexDirection: 'row', gap: 6, justifyContent: 'center', paddingTop: 8 },
  signupText: { ...typography.bodyMD, color: colors.muted },
  signupLink: { ...typography.bodyMD, color: colors.primary, fontWeight: '600' },
})
