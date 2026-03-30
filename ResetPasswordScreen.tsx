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

export function ResetPasswordScreen() {
  const navigation = useNavigation<any>()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const handleReset = async () => {
    if (!password || !confirm) return
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }

    setLoading(true)
    setError('')

    const { error: err } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (err) {
      setError(err.message)
    } else {
      setDone(true)
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
        {done ? (
          <View style={styles.successState}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={52} color={colors.success} />
            </View>
            <Text style={styles.successTitle}>Password Updated</Text>
            <Text style={styles.successSub}>
              Your password has been reset successfully. Sign in with your new password.
            </Text>
            <GoldButton
              label="Sign In"
              onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}
              fullWidth
              style={{ marginTop: 32 }}
            />
          </View>
        ) : (
          <View style={styles.body}>
            <View style={styles.header}>
              <Text style={styles.title}>Create New Password</Text>
              <Text style={styles.subtitle}>
                Your new password must be different from previously used passwords.
              </Text>
            </View>

            {/* New password */}
            <View style={styles.field}>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Min 6 characters"
                  placeholderTextColor={colors.muted}
                  secureTextEntry={!showPassword}
                  color={colors.foreground}
                  autoFocus
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

            {/* Confirm password */}
            <View style={styles.field}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                value={confirm}
                onChangeText={setConfirm}
                placeholder="Repeat your password"
                placeholderTextColor={colors.muted}
                secureTextEntry={!showPassword}
                color={colors.foreground}
              />
            </View>

            {/* Strength indicator */}
            {password.length > 0 && (
              <PasswordStrength password={password} />
            )}

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <GoldButton
              label="Reset Password"
              onPress={handleReset}
              loading={loading}
              disabled={!password || !confirm || password.length < 6}
              fullWidth
              style={{ marginTop: 8 }}
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  )
}

function PasswordStrength({ password }: { password: string }) {
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length

  const labels = ['Weak', 'Fair', 'Good', 'Strong']
  const colours = [colors.destructive, colors.historicAmber, colors.primary, colors.success]
  const label = score === 0 ? 'Weak' : labels[score - 1]
  const colour = score === 0 ? colors.destructive : colours[score - 1]

  return (
    <View style={strengthStyles.row}>
      {[1, 2, 3, 4].map((i) => (
        <View
          key={i}
          style={[strengthStyles.bar, { backgroundColor: i <= score ? colour : colors.secondary }]}
        />
      ))}
      <Text style={[strengthStyles.label, { color: colour }]}>{label}</Text>
    </View>
  )
}

const strengthStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bar: { flex: 1, height: 4, borderRadius: 2 },
  label: { ...typography.caption, width: 50, textAlign: 'right' },
})

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
  passwordRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  eyeBtn: {
    padding: 12, backgroundColor: colors.secondary,
    borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border,
  },
  error: { ...typography.bodyMD, color: colors.destructive, textAlign: 'center' },
  successState: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: layout.screenPaddingH, gap: 12,
  },
  successIcon: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: colors.secondary, borderWidth: 1,
    borderColor: colors.success + '44', alignItems: 'center', justifyContent: 'center',
  },
  successTitle: { ...typography.h2, color: colors.foreground, marginTop: 8 },
  successSub: { ...typography.bodyMD, color: colors.muted, textAlign: 'center', lineHeight: 24 },
})
