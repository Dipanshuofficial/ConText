"use client";

import * as React from "react";
import type { FormEvent } from "react"; // Explicit type import
import {
  Maximize,
  Minimize,
  SendHorizontal,
  Bot,
  User,
  Loader2,
  Minus,
  X,
  MessageSquarePlus,
  ChevronsUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat } from "@/hooks/use-chat";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ChatState = "normal" | "fullscreen" | "minimized";

export function ContextualChatPopup() {
  const [chatState, setChatState] = React.useState<ChatState>("normal");
  const [isOpen, setIsOpen] = React.useState<boolean>(true); // State to control overall visibility (open/closed)
  const [showRestartButton, setShowRestartButton] =
    React.useState<boolean>(false); // State to control restart button visibility
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    setMessages,
    setInput,
  } = useChat({
    initialApiConfig: {
      url: typeof window !== "undefined" ? window.location.href : "",
    },
  });
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null); // Ref for auto-scrolling

  const scrollToBottom = React.useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []); // Dependency array is empty as it only uses a ref

  React.useEffect(() => {
    if (isOpen && chatState !== "minimized" && messages.length > 0) {
      // Scroll to bottom slightly delayed to allow rendering
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 100); // Adjust delay as needed
      return () => clearTimeout(timer);
    }
  }, [messages, chatState, isOpen, scrollToBottom]); // Include scrollToBottom in dependencies

  const toggleFullScreen = React.useCallback(() => {
    setChatState((prev) => (prev === "fullscreen" ? "normal" : "fullscreen"));
  }, []);

  const minimizeChat = React.useCallback(() => {
    setChatState("minimized");
  }, []);

  const restoreChat = React.useCallback(() => {
    setChatState("normal");
  }, []);

  const closeChat = React.useCallback(() => {
    setIsOpen(false);
    setMessages([]); // Clear chat history
    setInput(""); // Clear input field
    setChatState("normal"); // Reset state if it was fullscreen
    setShowRestartButton(true); // Show the restart button
  }, [setMessages, setInput]); // Added dependencies

  const restartChat = React.useCallback(() => {
    setShowRestartButton(false);
    setIsOpen(true);
    // Messages and input are already cleared
  }, []);

  // Form submission handler using useCallback
  const handleFormSubmit = React.useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      handleSubmit(e);
    },
    [handleSubmit]
  );

  // === Render Logic ===

  // 1. Render Restart Button if closed
  if (!isOpen && showRestartButton) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={restartChat}
              className="fixed bottom-4 right-4 z-50 rounded-full h-14 w-14 bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background transition-all duration-300 ease-in-out scale-100 hover:scale-110 animate-in fade-in zoom-in-90"
              aria-label="Start new chat"
            >
              <MessageSquarePlus className="h-7 w-7" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            {" "}
            {/* Position tooltip */}
            <p>Start New Chat</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // 2. If chat is open but minimized, show the minimized icon
  if (isOpen && chatState === "minimized") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={restoreChat}
              className="fixed bottom-4 right-4 z-50 rounded-full h-14 w-14 bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background transition-all duration-300 ease-in-out scale-100 hover:scale-110 animate-in fade-in zoom-in-90"
              aria-label="Restore chat"
            >
              <Bot className="h-7 w-7" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            {" "}
            {/* Position tooltip */}
            <p>Open Chat</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // 3. Render nothing if closed and not showing restart button
  if (!isOpen) {
    return null;
  }

  // 4. Render the full chat card if open and not minimized
  return (
    <Card
      className={cn(
        "fixed bottom-4 right-4 z-50 flex flex-col shadow-xl transition-all duration-300 ease-in-out rounded-lg border overflow-hidden",
        "bg-card text-card-foreground", // Use theme colors
        chatState === "fullscreen"
          ? "w-[calc(100vw-2rem)] h-[calc(100vh-2rem)] top-4 left-4 bottom-auto right-auto" // Fullscreen dimensions
          : "w-96 h-[60vh] max-h-[700px]", // Normal dimensions
        // Apply animation class based on state for smooth transitions
        // Animations defined in globals.css
        chatState === "minimized"
          ? "animate-chat-minimize"
          : "animate-chat-restore"
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between p-3 border-b bg-muted/50">
        <CardTitle className="text-lg font-semibold flex items-center gap-2 text-foreground">
          <Bot className="h-5 w-5 text-primary" /> Contextual Chat
        </CardTitle>
        {/* macOS style window controls */}
        <div className="flex items-center space-x-1.5">
          {" "}
          {/* Adjusted spacing */}
          {/* Minimize Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="group">
                  {" "}
                  {/* Container for group-hover */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={minimizeChat}
                    className="h-4 w-4 rounded-full bg-[#FFBD2E] hover:bg-[#FFBD2E]/80 focus:outline-none focus:ring-1 focus:ring-[#E6A229] ring-offset-background ring-offset-1 flex items-center justify-center p-0" // Adjusted size and padding
                    aria-label="Minimize chat"
                  >
                    <Minus className="h-2.5 w-2.5 text-black opacity-0 group-hover:opacity-100 transition-opacity duration-150" />{" "}
                    {/* Adjusted icon size */}
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Minimize</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {/* Fullscreen/Restore Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="group">
                  {" "}
                  {/* Container for group-hover */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleFullScreen}
                    className="h-4 w-4 rounded-full bg-[#28C940] hover:bg-[#28C940]/80 focus:outline-none focus:ring-1 focus:ring-[#2DBF4E] ring-offset-background ring-offset-1 flex items-center justify-center p-0" // Adjusted size and padding
                    aria-label={
                      chatState === "fullscreen"
                        ? "Exit full screen"
                        : "Enter full screen"
                    }
                  >
                    <ChevronsUpDown className="h-2.5 w-2.5 text-black opacity-0 group-hover:opacity-100 transition-opacity duration-150" />{" "}
                    {/* Adjusted icon size */}
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>
                  {chatState === "fullscreen"
                    ? "Exit full screen"
                    : "Enter full screen"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {/* Close Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="group">
                  {" "}
                  {/* Container for group-hover */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={closeChat}
                    className="h-4 w-4 rounded-full bg-[#FF5F56] hover:bg-[#FF5F56]/80 focus:outline-none focus:ring-1 focus:ring-[#E0443E] ring-offset-background ring-offset-1 flex items-center justify-center p-0" // Adjusted size and padding
                    aria-label="Close chat"
                  >
                    <X className="h-2.5 w-2.5 text-black opacity-0 group-hover:opacity-100 transition-opacity duration-150" />{" "}
                    {/* Adjusted icon size */}
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Close Chat</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        {/* Scrollable chat area */}
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-4 space-y-4 bg-background h-full flex flex-col">
            {/* Placeholder when no messages */}
            {messages.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground flex-1">
                {" "}
                {/* Ensure it takes full height */}
                <Bot size={48} className="mb-4 text-primary" />
                <p className="text-sm">
                  "What is this page about?" or "Tell me something about AI!"
                </p>
              </div>
            )}
            {/* Display messages */}
            {messages.map((m) => (
              <div
                key={m.id} // Use stable ID
                className={cn(
                  "flex items-start gap-3 animate-in fade-in duration-500 ease-out",
                  m.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {/* Assistant Avatar */}
                {m.role === "assistant" && (
                  <Avatar className="h-8 w-8 border flex items-center justify-center shrink-0 bg-primary text-primary-foreground">
                    <AvatarFallback>
                      <Bot className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
                {/* Message Bubble */}
                <div
                  className={cn(
                    "max-w-[75%] rounded-lg px-3 py-2 text-sm shadow-sm break-words",
                    m.role === "user"
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary text-secondary-foreground border"
                  )}
                >
                  {/* Handle newlines in messages */}
                  {m.content.split("\n").map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < m.content.split("\n").length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>
                {/* User Avatar */}
                {m.role === "user" && (
                  <Avatar className="h-8 w-8 border flex items-center justify-center shrink-0 bg-accent text-accent-foreground">
                    <AvatarFallback>
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-start gap-3 justify-start animate-in fade-in duration-300">
                <Avatar className="h-8 w-8 border flex items-center justify-center shrink-0 bg-primary text-primary-foreground">
                  <AvatarFallback>
                    <Bot className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-secondary text-secondary-foreground rounded-lg px-3 py-2 text-sm border shadow-sm flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Thinking...
                </div>
              </div>
            )}
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 text-destructive justify-center p-2 bg-destructive/10 rounded-md animate-in fade-in duration-300 mt-2">
                <p className="text-sm">Error: {error.message}</p>
              </div>
            )}
            {/* Element to ensure auto-scrolling works */}
            <div ref={messagesEndRef} className="h-0" />
          </div>
        </ScrollArea>
      </CardContent>
      {/* Chat Input Footer */}
      <CardFooter className="p-3 border-t bg-muted/50">
        <form
          onSubmit={handleFormSubmit}
          className="flex w-full items-center gap-2"
        >
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="What's on this page?..."
            className="flex-1 bg-input border-input focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0" // Refined focus style
            disabled={isLoading}
            aria-label="Chat message input"
            autoComplete="off" // Disable browser autocomplete
          />
          <Button
            type="submit"
            size="icon"
            className="bg-accent text-accent-foreground hover:bg-accent/90 focus:outline-none focus:ring-1 focus:ring-ring focus:ring-offset-1" // Refined focus style
            disabled={isLoading || !input.trim()}
            aria-label="Send message"
          >
            <SendHorizontal className="h-5 w-5" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
