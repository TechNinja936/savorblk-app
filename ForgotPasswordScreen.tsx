import React, { useState } from 'react'
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, StatusBar,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../../lib/supabase'
import { GoldButton } from '../../components/ui/GoldButton'
import { colors } from '../../theme/colors'
import { typography } from '../../theme/typography'
import { radius, layout } from '../../theme/spacing'

export function ForgotPasswordScreen() {
  const navigation = useNavigation<any>()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleReset = async () => {
    if (!email) return
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'savorblk://reset-password',
    })
    setLoading(false)
    if (err) {
      setError(err.message)
    } else {
      setSent(true)
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

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {sent ? (
          <View style={styles.successState}>
            <View style={styles.successIcon}>
              <Ionicons name="mail-open-outline" size={52} color={colors.primary} />
            </View>
            <Text style={styles.successTitle}>Check your inbox</Text>
            <Text style={styles.successSub}>
              We sent a password reset link to{'\n'}<Text style={{ color: colors.foreground }}>{email}</Text>
            </Text>
            <GoldButton
              label="Back to Sign In"
              onPress={() => navigation.navigate('Login')}
              fullWidth
              style={{ marginTop: 32 }}
            />
            <TouchableOpacity style={{ marginTop: 16 }} onPress={() => setSent(false)}>
              <Text style={styles.resend}>Didn't get it? Try again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.body}>
            <View style={styles.header}>
              <Text style={styles.title}>Forgot Password?</Text>
              <Text style={styles.subtitle}>
                Enter your email address and we'll send you a link to reset your password.
              </Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@email.com"
                placeholderTextColor={colors.muted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
                color={colors.foreground}
              />
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <GoldButton
              label="Send Reset Link"
              onPress={handleReset}
              loading={loading}
              disabled={!email}
              fullWidth
              style={{ marginTop: 8 }}
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  backBtn: { padding: layout.screenPaddingH },
  body: { flex: 1, padding: layout.screenPaddingH, gap: 20 },
  header: { gap: 10, paddingTop: 8 },
  title: { ...typography.displayMD, color: colors.foreground },
  subtitle: { ...typography.bodyMD, color: colors.muted, lineHeight: 24 },
  field: { gap: 6 },
  label: { ...typography.labelSM, color: colors.muted },
  input: {
    ...typography.bodyMD, height: 52, borderRadius: radius.lg,
    paddingHorizontal: 16, backgroundColor: colors.secondary,
    borderWidth: 1, borderColor: colors.border, color: colors.foreground,
  },
  error: { ...typography.bodyMD, color: colors.destructive, textAlign: 'center' },
  successState: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: layout.screenPaddingH, gap: 12,
  },
  successIcon: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: colors.secondary, borderWidth: 1,
    borderColor: colors.primary + '44', alignItems: 'center', justifyContent: 'center',
  },
  successTitle: { ...typography.h2, color: colors.foreground, marginTop: 8 },
  successSub: { ...typography.bodyMD, color: colors.muted, textAlign: 'center', lineHeight: 24 },
  resend: { ...typography.bodyMD, color: colors.primary },
})
