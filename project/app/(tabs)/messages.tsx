// MessagesScreen.tsx
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity, // Still needed for Send Button and Conversation Items
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Keyboard,
  Image, // Import Image if using actual avatars
  StatusBar,
  Animated, // Import Animated API
} from 'react-native';
// Import Gesture Handler components
import { PanGestureHandler, State, GestureHandlerRootView } from 'react-native-gesture-handler';
// import Icon from 'react-native-vector-icons/Ionicons'; // Example if using icons

// --- Interfaces ---
interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  lastMessage: string;
  lastMessageTime: string; // ISO Date string preferred
  unreadCount: number;
  avatar: string | null; // URL or local require path
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string; // Use a constant like MY_USER_ID to check if sent by current user
  text: string;
  timestamp: string; // ISO Date string preferred
}

// --- Constants ---
const MY_USER_ID = 'user_me'; // Example current user ID
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_COLLAPSED_WIDTH = 65;
const SIDEBAR_EXPANDED_WIDTH_PERCENT = 0.8; // 80% of screen width
const SIDEBAR_EXPANDED_WIDTH = SCREEN_WIDTH * SIDEBAR_EXPANDED_WIDTH_PERCENT;
const SWIPE_THRESHOLD_DISTANCE = SCREEN_WIDTH * 0.15; // Min distance to trigger toggle
const SWIPE_THRESHOLD_VELOCITY = 500; // Min velocity to trigger toggle

const COLORS = {
  background: '#FFFFFF',
  sidebarBackground: '#F5F5F5',
  text: '#1C1C1E',
  textSecondary: '#8E8E93',
  primary: '#007AFF', // Blue accent
  sentBubble: '#007AFF',
  receivedBubble: '#E5E5EA',
  textLight: '#FFFFFF',
  textDark: '#000000',
  separator: '#D1D1D6',
  unreadBadge: '#FF3B30', // Red for unread, can use primary too
  selectedBorder: '#007AFF',
};

// --- Mock Data ---
const MOCK_CONVERSATIONS: Conversation[] = [
  { id: 'conv1', participantId: 'user2', participantName: 'Alice Smith', lastMessage: 'Okay, see you then!', lastMessageTime: new Date(Date.now() - 1000 * 60 * 5).toISOString(), unreadCount: 2, avatar: null },
  { id: 'conv2', participantId: 'user3', participantName: 'Bob Johnson', lastMessage: 'Sounds good! Let me know if anything changes.', lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), unreadCount: 0, avatar: null },
  { id: 'conv3', participantId: 'user4', participantName: 'Charlie Brown', lastMessage: 'Can you send me the file?', lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), unreadCount: 1, avatar: null },
  { id: 'conv4', participantId: 'user5', participantName: 'Diana Prince', lastMessage: 'Thanks!', lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), unreadCount: 0, avatar: null },
];

const MOCK_MESSAGES: Message[] = [
  { id: 'msg1', conversationId: 'conv1', senderId: 'user2', text: 'Hey, are you free tomorrow?', timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString() },
  { id: 'msg2', conversationId: 'conv1', senderId: MY_USER_ID, text: 'Yeah, what time?', timestamp: new Date(Date.now() - 1000 * 60 * 9).toISOString() },
  { id: 'msg3', conversationId: 'conv1', senderId: 'user2', text: 'Around 2 PM?', timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString() },
  { id: 'msg4', conversationId: 'conv1', senderId: MY_USER_ID, text: 'Perfect.', timestamp: new Date(Date.now() - 1000 * 60 * 7).toISOString() },
  { id: 'msg5', conversationId: 'conv1', senderId: 'user2', text: 'Okay, see you then!', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
  { id: 'msg6', conversationId: 'conv2', senderId: MY_USER_ID, text: 'Project update?', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() },
  { id: 'msg7', conversationId: 'conv2', senderId: 'user3', text: 'Sounds good! Let me know if anything changes.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
  { id: 'msg8', conversationId: 'conv3', senderId: 'user4', text: 'Can you send me the file?', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
];

// --- Helper Functions ---
const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  const now = new Date();
  // Very basic check if it's today
  if (date.toDateString() === now.toDateString()) {
      return formatTime(isoString); // Show time if today
  }
  // Simple M/D format otherwise
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

const formatTime = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

// --- Helper Components ---

// Simple Avatar Placeholder
const AvatarPlaceholder = ({ name, size = 40 }: { name: string | undefined; size?: number }) => {
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  // Generate a simple hash for background color variation
  const hashCode = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
          hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      return hash;
  };
  const hue = Math.abs(hashCode(name || '?')) % 360;
  const backgroundColor = `hsl(${hue}, 60%, 80%)`;

  return (
      <View style={[styles.avatarBase, { width: size, height: size, borderRadius: size / 2, backgroundColor }]}>
          <Text style={[styles.avatarText, { fontSize: size * 0.5 }]}>{initial}</Text>
      </View>
  );
};


// Unread Count Badge
const UnreadBadge = ({ count, style }: { count: number; style?: object }) => {
  if (count <= 0) return null;
  return (
    <View style={[styles.unreadBadgeBase, style]}>
      <Text style={styles.unreadBadgeText}>{count > 9 ? '9+' : count}</Text>
    </View>
  );
};

// Conversation List Item
interface ConversationItemProps {
  conversation: Conversation;
  isExpanded: boolean; // Still useful for conditional rendering inside
  isSelected: boolean;
  onPress: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = React.memo(({ conversation, isExpanded, isSelected, onPress }) => {
  // Determine padding based on the expanded state, not the animation value directly
  const paddingHorizontal = isExpanded ? 15 : (SIDEBAR_COLLAPSED_WIDTH - 40) / 2;

  return (
    // Use TouchableOpacity for press interaction on item
    <TouchableOpacity
      style={[
        styles.conversationItemContainer,
        isSelected && styles.conversationItemSelected,
        { paddingHorizontal } // Apply dynamic padding
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        {/* Replace AvatarPlaceholder with Image component when ready */}
        <AvatarPlaceholder name={conversation.participantName} size={40} />
        {/* Show overlay badge only when collapsed (isExpanded is false) */}
        {!isExpanded && conversation.unreadCount > 0 && (
            <UnreadBadge count={conversation.unreadCount} style={styles.unreadBadgeOverlay} />
        )}
      </View>

      {/* Optimization: Use opacity or clipping via parent instead of conditional render if preferred */}
      {/* Here we use conditional rendering based on the target state for simplicity */}
      {isExpanded && (
        <View style={styles.conversationDetails}>
          <View style={styles.conversationNameRow}>
            <Text style={styles.participantName} numberOfLines={1}>{conversation.participantName}</Text>
            <Text style={styles.lastMessageDate}>{formatDate(conversation.lastMessageTime)}</Text>
          </View>
          <View style={styles.conversationPreviewRow}>
            <Text style={styles.lastMessagePreview} numberOfLines={1} ellipsizeMode="tail">
              {conversation.lastMessage}
            </Text>
            {conversation.unreadCount > 0 && (
              <UnreadBadge count={conversation.unreadCount} style={styles.unreadBadgeInline} />
            )}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
});


// Message Bubble
interface MessageBubbleProps {
  message: Message;
  isSentByUser: boolean;
}
const MessageBubble: React.FC<MessageBubbleProps> = React.memo(({ message, isSentByUser }) => {
  return (
    <View style={[
      styles.messageRow,
      isSentByUser ? styles.messageRowSent : styles.messageRowReceived
    ]}>
      <View style={[
        styles.messageBubbleBase,
        isSentByUser ? styles.messageBubbleSent : styles.messageBubbleReceived
      ]}>
        <Text style={isSentByUser ? styles.messageTextSent : styles.messageTextReceived}>
          {message.text}
        </Text>
        <Text style={[
          styles.messageTimestamp,
          isSentByUser ? styles.messageTimestampSent : styles.messageTimestampReceived
        ]}>
          {formatTime(message.timestamp)}
        </Text>
      </View>
    </View>
  );
});


// --- Main Component ---
const MessagesScreen: React.FC = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false); // Start collapsed
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(MOCK_CONVERSATIONS[0]?.id ?? null); // Select first one initially
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [newMessageText, setNewMessageText] = useState('');
  const messageListRef = useRef<FlatList>(null);

  // --- Animation Setup ---
  const sidebarAnim = useRef(new Animated.Value(SIDEBAR_COLLAPSED_WIDTH)).current; // Animated value for sidebar width

  useEffect(() => {
    // Animate sidebar width based on isSidebarExpanded state
    Animated.timing(sidebarAnim, {
      toValue: isSidebarExpanded ? SIDEBAR_EXPANDED_WIDTH : SIDEBAR_COLLAPSED_WIDTH,
      duration: 50, // Animation duration
      useNativeDriver: false, // 'width' cannot be animated natively
    }).start();
  }, [isSidebarExpanded, sidebarAnim]);

  // --- Gesture Handler Logic ---
  const onPanGestureEvent = Animated.event(
    [], // No direct mapping needed for continuous events here
    { useNativeDriver: false } // Set to false as we are not driving transforms or opacity
  );

  const onPanHandlerStateChange = useCallback(
    (event: any) => { // Use specific type from gesture-handler if preferred: PanGestureHandlerStateChangeEvent
      if (event.nativeEvent.oldState === State.ACTIVE) {
        const { translationX, velocityX } = event.nativeEvent;
        const isSwipingRight = translationX > 0;
        const isSwipingLeft = translationX < 0;
        const absTranslationX = Math.abs(translationX);

        // Determine if the swipe meets the criteria to toggle
        let shouldToggle = false;

        if (isSwipingRight && !isSidebarExpanded) {
          // Swipe right to EXPAND
          if (absTranslationX > SWIPE_THRESHOLD_DISTANCE || velocityX > SWIPE_THRESHOLD_VELOCITY) {
            shouldToggle = true;
          }
        } else if (isSwipingLeft && isSidebarExpanded) {
          // Swipe left to COLLAPSE
          if (absTranslationX > SWIPE_THRESHOLD_DISTANCE || velocityX < -SWIPE_THRESHOLD_VELOCITY) {
             shouldToggle = true;
          }
        }

        if (shouldToggle) {
          setIsSidebarExpanded(prev => !prev);
          Keyboard.dismiss(); // Dismiss keyboard on successful toggle swipe
        }
        // else: If swipe didn't meet threshold, the animation will naturally snap back
        // because the `isSidebarExpanded` state didn't change.
      }
    },
    [isSidebarExpanded] // Dependency ensures the callback uses the current sidebar state
  );

  // --- Other Handlers ---
  const selectedConversation = useMemo(() => {
    return conversations.find(c => c.id === selectedConversationId);
  }, [selectedConversationId, conversations]);

  const displayedMessages = useMemo(() => {
    if (!selectedConversationId) return [];
    return messages
        .filter(msg => msg.conversationId === selectedConversationId)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()); // Ensure sorted for inverted list
  }, [selectedConversationId, messages]);

  const handleSelectConversation = useCallback((conversationId: string) => {
    setSelectedConversationId(conversationId);
    // Collapse sidebar on selection (optional but common UX)
    setIsSidebarExpanded(false);
    // Maybe mark conversation as read here or fetch new messages
    setMessages(prev => prev.map(msg => msg.conversationId === conversationId ? {...msg} : msg)); // Trigger re-render if needed
    setTimeout(() => messageListRef.current?.scrollToEnd({ animated: false }), 100); // Ensure scroll to end after selection
  }, []); // No dependency on isSidebarExpanded needed here

  const handleSendMessage = useCallback(() => {
    if (!newMessageText.trim() || !selectedConversationId) return;

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      conversationId: selectedConversationId,
      senderId: MY_USER_ID,
      text: newMessageText.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, newMessage]);

    // Update the conversation list (last message, time)
    setConversations(prev => prev.map(conv =>
        conv.id === selectedConversationId
            ? { ...conv, lastMessage: newMessage.text, lastMessageTime: newMessage.timestamp }
            : conv
    ).sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()) // Bring updated conv to top
    );

    setNewMessageText('');
    Keyboard.dismiss();
    // Scroll handled by FlatList's inverted prop usually, might need timeout adjustment if keyboard causes issues
    // setTimeout(() => messageListRef.current?.scrollToEnd({ animated: true }), 100);
  }, [newMessageText, selectedConversationId]);

  // --- Render Functions ---
  const renderConversationItem = useCallback(({ item }: { item: Conversation }) => (
    <ConversationItem
      conversation={item}
      isExpanded={isSidebarExpanded} // Pass state for internal logic/styling
      isSelected={item.id === selectedConversationId}
      onPress={() => handleSelectConversation(item.id)}
    />
  ), [isSidebarExpanded, selectedConversationId, handleSelectConversation]);

  const renderMessageItem = useCallback(({ item }: { item: Message }) => (
    <MessageBubble message={item} isSentByUser={item.senderId === MY_USER_ID} />
  ), []);


  // --- Main Render Structure ---
  // IMPORTANT: Wrap your component or the entire App in <GestureHandlerRootView>
  // If this component is the root, wrap it here. If using React Navigation, it's usually handled.
  return (
    <GestureHandlerRootView style={styles.flexOne}>
      <PanGestureHandler
        onGestureEvent={onPanGestureEvent}
        onHandlerStateChange={onPanHandlerStateChange}
        // Activate only after significant horizontal movement to allow vertical scroll
        activeOffsetX={[-15, 15]} // Prevent activation on vertical scroll intent
        failOffsetY={[-15, 15]} // Fail gesture if vertical movement is too large
      >
        <Animated.View style={styles.screenContainer}>
          <StatusBar barStyle="dark-content" />
          <View style={styles.mainRowContainer}>
            {/* --- Sidebar (Animated Width) --- */}
            <Animated.View style={[styles.sidebarContainer, { width: sidebarAnim }]}>
              {conversations.length > 0 ? (
                <FlatList
                  data={conversations}
                  renderItem={renderConversationItem}
                  keyExtractor={item => item.id}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.conversationListContent}
                  // Allowing scroll always, PanGestureHandler's activeOffsetX should manage conflict
                  scrollEnabled={true}
                />
              ) : (
                // Only show empty text if sidebar is logically expanded
                 isSidebarExpanded && <View style={styles.emptySidebarView}><Text style={styles.emptyStateText}>No conversations</Text></View>
              )}
            </Animated.View>

            {/* --- Main Content (Message Thread) --- */}
            <KeyboardAvoidingView
              style={styles.messageThreadContainer} // Will automatically take remaining space
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0} // Adjust as needed
            >
              {selectedConversation ? (
                <>
                  {/* Header */}
                  <View style={styles.messageHeader}>
                    <AvatarPlaceholder name={selectedConversation.participantName} size={30} />
                    <Text style={styles.messageHeaderName}>{selectedConversation.participantName}</Text>
                  </View>

                  {/* Message List */}
                  <FlatList
                    ref={messageListRef}
                    data={displayedMessages}
                    renderItem={renderMessageItem}
                    keyExtractor={item => item.id}
                    style={styles.messageList}
                    contentContainerStyle={styles.messageListContent}
                    inverted
                    showsVerticalScrollIndicator={false}
                    maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
                    // Ensure scrolling works alongside gesture handler
                    scrollEnabled={true}
                    onLayout={() => {
                        // Initial scroll to end might be needed after messages load
                        if (displayedMessages.length > 0) {
                            messageListRef.current?.scrollToEnd({ animated: false });
                        }
                    }}
                  />

                  {/* Input Area */}
                  <View style={styles.inputAreaContainer}>
                    <TextInput
                      style={styles.textInput}
                      value={newMessageText}
                      onChangeText={setNewMessageText}
                      placeholder="Type a message..."
                      placeholderTextColor={COLORS.textSecondary}
                      multiline
                      blurOnSubmit={false} // Consider setting true if Return key should send
                    />
                    <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage} activeOpacity={0.7}>
                      {/* <Icon name="send" size={24} color={COLORS.primary} /> */}
                      <Text style={styles.sendButtonText}>Send</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <View style={styles.emptyStateContainer}>
                  <Text style={styles.emptyStateText}>Select a conversation to start chatting</Text>
                </View>
              )}
            </KeyboardAvoidingView>
          </View>
        </Animated.View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  flexOne: { // Added for GestureHandlerRootView
    flex: 1,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mainRowContainer: {
    flex: 1,
    flexDirection: 'row',
    overflow: 'hidden', // Crucial to clip sidebar content during animation
  },
  // --- Sidebar Styles ---
  sidebarContainer: {
    // Width is now Animated
    height: '100%',
    backgroundColor: COLORS.sidebarBackground,
    borderRightWidth: 1,
    borderRightColor: COLORS.separator,
  },
  conversationListContent: {
    paddingBottom: 30, // Add padding at the bottom if needed
  },
  conversationItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    // paddingHorizontal set dynamically in component based on isExpanded state
    borderBottomWidth: 1,
    borderBottomColor: COLORS.separator,
    // Use minWidth to prevent content reflow during animation
    minWidth: SIDEBAR_EXPANDED_WIDTH,
  },
  conversationItemSelected: {
    backgroundColor: '#E0E0E0', // Light selection background
  },
  avatarContainer: {
    marginRight: 12, // Keep consistent margin
    position: 'relative', // For overlay badge positioning
  },
  avatarBase: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#CCCCCC', // Default bg if no color generated
  },
  avatarText: {
    color: COLORS.textDark,
    fontWeight: 'bold',
  },
  conversationDetails: {
    flex: 1, // Take remaining space
    // Opacity can also be animated for smoother fade if required
  },
  conversationNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    flexShrink: 1, // Prevent name from pushing date off-screen
    marginRight: 8,
  },
  lastMessageDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  conversationPreviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessagePreview: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1, // Take available space before badge
    marginRight: 8,
  },
  unreadBadgeBase: {
    backgroundColor: COLORS.unreadBadge,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20, // Ensure circle shape for single digit
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadgeText: {
    color: COLORS.textLight,
    fontSize: 11,
    fontWeight: 'bold',
  },
  unreadBadgeInline: {
    // Style for badge next to preview text
  },
  unreadBadgeOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -4,
    borderWidth: 1, // Optional border for better visibility
    borderColor: COLORS.sidebarBackground, // Match background
  },
   emptySidebarView: { // Style for empty state text within sidebar
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  // --- Main Content Styles ---
  messageThreadContainer: {
    flex: 1, // Takes remaining space from sidebar
    backgroundColor: COLORS.background,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.separator,
    backgroundColor: COLORS.background, // Keep header opaque
  },
  messageHeaderName: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 10,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  messageRow: {
      flexDirection: 'row',
      marginVertical: 5,
  },
  messageRowSent: {
      justifyContent: 'flex-end',
      marginLeft: 50, // Indent sent messages
  },
  messageRowReceived: {
      justifyContent: 'flex-start',
      marginRight: 50, // Indent received messages
  },
  messageBubbleBase: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 18,
      maxWidth: '85%', // Limit bubble width
  },
  messageBubbleSent: {
      backgroundColor: COLORS.sentBubble,
  },
  messageBubbleReceived: {
      backgroundColor: COLORS.receivedBubble,
  },
  messageTextSent: {
      fontSize: 16,
      color: COLORS.textLight,
  },
  messageTextReceived: {
      fontSize: 16,
      color: COLORS.textDark,
  },
  messageTimestamp: {
      fontSize: 11,
      marginTop: 4,
      alignSelf: 'flex-end', // Position timestamp bottom-right
  },
  messageTimestampSent: {
      color: COLORS.textLight + 'B3', // Slightly transparent white
  },
  messageTimestampReceived: {
      color: COLORS.textSecondary,
  },
  inputAreaContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end', // Align items to bottom for multiline input
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.separator,
    backgroundColor: COLORS.background, // Ensure bg for safe area
  },
  textInput: {
    flex: 1,
    minHeight: 40, // Base height
    maxHeight: 120, // Limit height expansion
    backgroundColor: COLORS.receivedBubble, // Light gray background
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8, // Adjust padding per platform for multiline
    paddingTop: Platform.OS === 'ios' ? 10 : 8, // Explicit paddingTop might be needed
    fontSize: 16,
    marginRight: 10,
    color: COLORS.textDark,
  },
  sendButton: {
    height: 40, // Match min input height
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  // --- Empty State Styles ---
  emptyStateContainer: { // Empty state for main message area
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: { // Generic empty state text
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default MessagesScreen;