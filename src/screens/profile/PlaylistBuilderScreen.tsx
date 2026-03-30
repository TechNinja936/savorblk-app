import React, { useState, useRef, useEffect } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
  ActivityIndicator, StatusBar, Keyboard,
} from 'react-native'
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { aiService, type ChatMessage, type PlaylistRequest } from '../../services/aiService'
import { colors } from '../../theme/colors'
import { typography } from '../../theme/typography'
import { radius } from '../../theme/spacing'

type ConversationStep = {
  field: keyof PlaylistRequest | null
  value?: string
}

export function PlaylistBuilderScreen() {
  const navigation = useNavigation<any>()
  const scrollRef = useRef<ScrollView>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [step, setStep] = useState(0)
  const [requestData, setRequestData] = useState<Partial<PlaylistRequest>>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedRoute, setGeneratedRoute] = useState<any>(null)

  // Start conversation on mount
  useEffect(() => {
    const firstPrompt = aiService.getNextPrompt(0)
    setTimeout(() => {
      addMessage(firstPrompt.message, 'assistant')
    }, 600)
  }, [])

  const addMessage = (content: string, role: 'user' | 'assistant') => {
    setMessages((prev) => [...prev, { role, content, timestamp: new Date() }])
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100)
  }

  const handleSend = async () => {
    if (!input.trim() || isTyping) return
    const userText = input.trim()
    setInput('')
    Keyboard.dismiss()

    addMessage(userText, 'user')

    const current = aiService.getNextPrompt(step, userText)

    // Update request data
    if (current.field) {
      const newData = { ...requestData, [current.field]: userText }
      setRequestData(newData)

      // Check if we have all we need
      if (step >= 5) {
        // All data collected — generate
        setIsTyping(true)
        addMessage("Let me craft your perfect Vibe Route... 🗺️✨", 'assistant')

        setTimeout(async () => {
          setIsTyping(false)
          setIsGenerating(true)
          try {
            const itinerary = await aiService.buildPlaylist({
              city: newData.city ?? '',
              startDate: newData.startDate ?? new Date().toISOString().split('T')[0],
              endDate: newData.endDate ?? new Date().toISOString().split('T')[0],
              hotelName: newData.hotelName,
              vibes: typeof newData.vibes === 'string'
                ? (newData.vibes as string).split(',').map((v: string) => v.trim())
                : [],
              groupSize: parseInt(String(newData.groupSize ?? '2')),
              dietaryNeeds: newData.dietaryNeeds,
            })
            setGeneratedRoute(itinerary)
            addMessage(
              `Here's your personalized **${itinerary.title}** 🎉\n\n${itinerary.description}\n\n${itinerary.stops.length} stops crafted just for you!`,
              'assistant'
            )
          } catch (err) {
            addMessage("I couldn't generate your route right now. Please try again!", 'assistant')
          } finally {
            setIsGenerating(false)
          }
        }, 1000)
        return
      }
    }

    // Next question
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      const next = aiService.getNextPrompt(step + 1, userText)
      addMessage(next.message, 'assistant')
      setStep((s) => s + 1)
    }, 800)
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView edges={['top']} style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-down" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <View style={styles.aiDot} />
          <Text style={styles.headerText}>SavorBLK AI Concierge</Text>
        </View>
        <View style={{ width: 40 }} />
      </SafeAreaView>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.messageList}
          contentContainerStyle={styles.messageContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg, i) => (
            <Animated.View
              key={i}
              entering={FadeInUp.delay(50).duration(300)}
              style={[
                styles.bubble,
                msg.role === 'user' ? styles.userBubble : styles.aiBubble,
              ]}
            >
              {msg.role === 'assistant' && (
                <View style={styles.aiAvatar}>
                  <Text style={styles.aiAvatarText}>S</Text>
                </View>
              )}
              <View style={[
                styles.bubbleContent,
                msg.role === 'user' ? styles.userContent : styles.aiContent,
              ]}>
                <Text style={[
                  styles.bubbleText,
                  msg.role === 'user' ? styles.userText : styles.aiText,
                ]}>
                  {msg.content}
                </Text>
              </View>
            </Animated.View>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <Animated.View entering={FadeInDown.duration(200)} style={[styles.bubble, styles.aiBubble]}>
              <View style={styles.aiAvatar}>
                <Text style={styles.aiAvatarText}>S</Text>
              </View>
              <View style={styles.typingIndicator}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            </Animated.View>
          )}

          {/* Generated route card */}
          {generatedRoute && (
            <Animated.View entering={FadeInUp.duration(400)} style={styles.routeCard}>
              <Text style={styles.routeTitle}>{generatedRoute.title}</Text>
              <Text style={styles.routeDesc}>{generatedRoute.description}</Text>
              {generatedRoute.stops?.slice(0, 3).map((stop: any, i: number) => (
                <View key={i} style={styles.stopRow}>
                  <View style={styles.stopDot} />
                  <Text style={styles.stopText}>
                    <Text style={styles.stopTime}>Day {stop.day} {stop.time} — </Text>
                    {stop.businessName}
                  </Text>
                </View>
              ))}
              {generatedRoute.stops?.length > 3 && (
                <Text style={styles.moreStops}>+{generatedRoute.stops.length - 3} more stops</Text>
              )}
            </Animated.View>
          )}
        </ScrollView>

        {/* Input bar */}
        <SafeAreaView edges={['bottom']} style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Type your answer..."
              placeholderTextColor={colors.muted}
              returnKeyType="send"
              onSubmitEditing={handleSend}
              multiline={false}
              editable={!isGenerating}
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!input.trim() || isGenerating) && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={!input.trim() || isGenerating}
            >
              <Ionicons name="arrow-up" size={20} color={colors.primaryForeground} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  closeBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  aiDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
  headerText: { ...typography.labelLG, color: colors.foreground },

  messageList: { flex: 1 },
  messageContent: { padding: 16, paddingBottom: 24, gap: 12 },

  bubble: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  userBubble: { justifyContent: 'flex-end' },
  aiBubble: { justifyContent: 'flex-start' },

  aiAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(201,153,10,0.2)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.primaryDim,
  },
  aiAvatarText: { ...typography.labelMD, color: colors.primary },

  bubbleContent: { maxWidth: '80%', borderRadius: radius.xl, padding: 12 },
  userContent: {
    backgroundColor: colors.primary, borderBottomRightRadius: 4,
  },
  aiContent: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderBottomLeftRadius: 4,
  },
  bubbleText: { ...typography.bodyMD, lineHeight: 22 },
  userText: { color: colors.primaryForeground },
  aiText: { color: colors.foreground },

  typingIndicator: {
    padding: 12, backgroundColor: colors.card,
    borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border,
  },

  // Generated route card
  routeCard: {
    backgroundColor: 'rgba(201,153,10,0.08)',
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colors.primaryDim,
    padding: 16,
    gap: 10,
    marginTop: 8,
  },
  routeTitle: { ...typography.h3, color: colors.primary },
  routeDesc: { ...typography.bodyMD, color: colors.muted, lineHeight: 22 },
  stopRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  stopDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary,
    marginTop: 7,
  },
  stopText: { ...typography.bodyMD, color: colors.foreground, flex: 1 },
  stopTime: { color: colors.primary, fontWeight: '600' },
  moreStops: { ...typography.labelSM, color: colors.muted, paddingLeft: 18 },

  // Input
  inputContainer: {
    borderTopWidth: 1, borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  input: {
    flex: 1, ...typography.bodyMD, color: colors.foreground,
    backgroundColor: colors.secondary, borderRadius: radius.full,
    paddingHorizontal: 16, paddingVertical: 10,
    borderWidth: 1, borderColor: colors.border,
  },
  sendBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: colors.primaryDim, opacity: 0.5 },
})
