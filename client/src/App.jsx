"use client"

import { useState, useEffect } from "react"
import "./App.css"
import MessageBoard from "../../build/contracts/MessageBoard.json"
import { ethers } from "ethers"
import { Loader2, Send, RefreshCw, Wallet, Copy, Check } from "lucide-react"

function App() {
  const [message, setMessage] = useState("Loading...")
  const [newMessage, setNewMessage] = useState("")
  const [contract, setContract] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [transactionStatus, setTransactionStatus] = useState(null)
  const [statusType, setStatusType] = useState("pending") // pending, success, error
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          // Request account access
          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
          setWalletConnected(true)
          setWalletAddress(accounts[0])

          // Create contract instance
          const provider = new ethers.BrowserProvider(window.ethereum)
          const signer = await provider.getSigner()
          const contractAddress = "0x7C5656219BE04f8C4ce74C6a43fC739300B5074d"
          const contractInstance = new ethers.Contract(contractAddress, MessageBoard.abi, signer)
          setContract(contractInstance)

          // Load initial message
          const currentMessage = await contractInstance.getMessage()
          setMessage(currentMessage)
          setIsLoading(false)
        } catch (error) {
          console.error("Error initializing:", error)
          setIsLoading(false)
          setMessage("Error connecting to blockchain")
        }
      } else {
        setIsLoading(false)
        setMessage("Please install MetaMask to use this app")
      }
    }

    init()
  }, [])

  const updateMessage = async () => {
    if (contract && newMessage) {
      try {
        setIsUpdating(true)
        setTransactionStatus("Sending transaction...")
        setStatusType("pending")

        const tx = await contract.updateMessage(newMessage)
        setTransactionStatus("Waiting for confirmation...")

        await tx.wait()
        setTransactionStatus("Message updated successfully!")
        setStatusType("success")

        const updatedMessage = await contract.getMessage()
        setMessage(updatedMessage)
        setNewMessage("")

        setTimeout(() => {
          setTransactionStatus(null)
        }, 5000)
      } catch (error) {
        console.error("Error updating message:", error)
        setTransactionStatus("Transaction failed")
        setStatusType("error")
        setTimeout(() => {
          setTransactionStatus(null)
        }, 5000)
      } finally {
        setIsUpdating(false)
      }
    }
  }

  const refreshMessage = async () => {
    if (contract) {
      try {
        setIsLoading(true)
        const currentMessage = await contract.getMessage()
        setMessage(currentMessage)
        setTransactionStatus("Message refreshed")
        setStatusType("success")
        setTimeout(() => {
          setTransactionStatus(null)
        }, 3000)
      } catch (error) {
        console.error("Error refreshing message:", error)
        setTransactionStatus("Refresh failed")
        setStatusType("error")
        setTimeout(() => {
          setTransactionStatus(null)
        }, 3000)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const formatWalletAddress = (address) => {
    if (!address) return ""
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  const copyMessage = () => {
    if (message && message !== "Loading..." && message !== "Error connecting to blockchain") {
      navigator.clipboard.writeText(message)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="app-container">
      <div className="message-box">
        <div className="box-header">
          <h1 className="title">Blockchain Message Board</h1>

          {walletConnected ? (
            <div className="wallet-info">
              <Wallet size={16} />
              <span>{formatWalletAddress(walletAddress)}</span>
            </div>
          ) : (
            <div className="wallet-info disconnected">
              <Wallet size={16} />
              <span>Wallet Not Connected</span>
            </div>
          )}
        </div>

        <div className="content-area">
          <div className="message-section">
            <div className="section-header">
              <h2>Current Message</h2>
              <button
                onClick={copyMessage}
                className="icon-button"
                disabled={isLoading || message === "Error connecting to blockchain"}
                title="Copy Message"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>

            <div className="message-display">
              {isLoading ? (
                <div className="loading">
                  <Loader2 className="spinner" />
                  <span>Loading message from blockchain...</span>
                </div>
              ) : (
                <p className="message-text">{message}</p>
              )}
            </div>

            <button
              onClick={refreshMessage}
              className="refresh-button"
              disabled={isUpdating || !walletConnected || isLoading}
            >
              <RefreshCw size={18} className={isLoading ? "spinning" : ""} />
              <span>Refresh Message</span>
            </button>
          </div>

          <div className="input-section">
            <h2>Update Message</h2>

            <div className="input-area">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Enter your message..."
                className="message-input"
                disabled={isUpdating || !walletConnected}
                rows={5}
              />

              <button
                onClick={updateMessage}
                className="update-button"
                disabled={isUpdating || !newMessage || !walletConnected}
              >
                {isUpdating ? <Loader2 className="spinner" /> : <Send size={18} />}
                <span>{isUpdating ? "Updating..." : "Update Message"}</span>
              </button>
            </div>
          </div>
        </div>

        {transactionStatus && <div className={`status-message ${statusType}`}>{transactionStatus}</div>}

        {!walletConnected && (
          <div className="wallet-warning">Please connect your wallet to interact with the blockchain</div>
        )}
      </div>
    </div>
  )
}

export default App
