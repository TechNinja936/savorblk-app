import React, { useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, StatusBar,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { useDebouncedCallback } from 'use-debounce'
import { supabase } from '../../lib/supabase'
import { GoldButton } from '../../components/ui/GoldButton'
import { colors } from '../../theme/colors'
import { typography } from '../../theme/typography'
import { radius, layout } from '../../theme/spacing'

export function SignupScreen() {
  const navigation = useNavigation<any>()
  const [form, setForm] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
  })
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const checkUsername = useDebouncedCallback(async (username: string) => {
    if (username.length < 3) { setUsernameAvailable(null); return }
    const { data } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('username', username)
      .maybeSingle()
    setUsernameAvailable(!data)
  }, 500)

  const handleUsernameChange = (text: string) => {
    const clean = text.toLowerCase().replace(/[^a-z0-9_]/g, '')
    setForm((f) => ({ ...f, username: clean }))
    checkUsername(clean)
  }

  const handleSignup = async () => {
    if (!form.fullName || !form.username || !form.email || !form.password) return
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    setError('')

    const { error: err } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.fullName,
          username: form.username,
        },
      },
    })

    setLoading(false)
    if (err) {
      setError(err.message)
    } else {
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] })
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView edges={['top']}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
      </SafeAreaView>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <View style={styles.logoSection}>
            <Text style={styles.logo}>SavorBLK</Text>
            <Text style={styles.tagline}>Join the community</Text>
          </View>

          {/* Full name */}
          <View style={styles.field}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={form.fullName}
              onChangeText={(v) => setForm((f) => ({ ...f, fullName: v }))}
              placeholder="Your name"
              placeholderTextColor={colors.muted}
              color={colors.foreground}
            />
          </View>

          {/* Username */}
          <View style={styles.field}>
            <Text style={styles.label}>Username</Text>
            <View style={styles.usernameRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={form.username}
                onChangeText={handleUsernameChange}
                placeholder="@yourhandle"
                placeholderTextColor={colors.muted}
                autoCapitalize="none"
                autoCorrect={false}
                color={colors.foreground}
              />
              {form.username.length >= 3 && usernameAvailable !== null && (
                <Ionicons
                  name={usernameAvailable ? 'checkmark-circle' : 'close-circle'}
                  size={22}
                  color={usernameAvailable ? colors.success : colors.destructive}
                />
              )}
            </View>
            {form.username.length >= 3 && (
              <Text style={[styles.usernamePreview, { color: usernameAvailable ? colors.primary : colors.muted }]}>
                savorblk.com/u/{form.username}
              </Text>
            )}
          </View>

          {/* Email */}
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={form.email}
              onChangeText={(v) => setForm((f) => ({ ...f, email: v }))}
              placeholder="you@email.com"
              placeholderTextColor={colors.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              color={colors.foreground}
            />
          </View>

          {/* Password */}
          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={form.password}
              onChangeText={(v) => setForm((f) => ({ ...f, password: v }))}
              placeholder="Min 6 characters"
              placeholderTextColor={colors.muted}
              secureTextEntry
              color={colors.foreground}
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <GoldButton
            label="Create Account"
            onPress={handleSignup}
            loading={loading}
            disabled={!form.fullName || !form.email || !form.password || form.username.length < 3}
            fullWidth
            style={styles.signupBtn}
          />

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Sign in</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.terms}>
            By signing up you agree to our Terms of Service and Privacy Policy
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  backBtn: { padding: layout.screenPaddingH },
  body: { padding: layout.screenPaddingH, paddingTop: 0, gap: 16 },
  logoSection: { alignItems: 'center', paddingVertical: 20, gap: 6 },
  logo: { ...typography.displayMD, color: colors.primary },
  tagline: { ...typography.bodyMD, color: colors.muted },
  field: { gap: 6 },
  label: { ...typography.labelSM, color: colors.muted },
  input: {
    ...typography.bodyMD, height: 52, borderRadius: radius.lg,
    paddingHorizontal: 16, backgroundColor: colors.secondary,
    borderWidth: 1, borderColor: colors.border,
  },
  usernameRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  usernamePreview: { ...typography.labelSM },
  error: { ...typography.bodyMD, color: colors.destructive, textAlign: 'center' },
  signupBtn: { marginTop: 4 },
  loginRow: { flexDirection: 'row', gap: 6, justifyContent: 'center' },
  loginText: { ...typography.bodyMD, color: colors.muted },
  loginLink: { ...typography.bodyMD, color: colors.primary, fontWeight: '600' },
  terms: { ...typography.caption, color: colors.muted, textAlign: 'center', lineHeight: 18 },
})
