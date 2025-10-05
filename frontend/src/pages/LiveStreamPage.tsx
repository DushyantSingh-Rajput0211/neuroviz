import { useState, useEffect, useRef } from 'react'
import { 
  Play, 
  Pause, 
  Square, 
  Settings, 
  Activity, 
  Brain,
  Wifi,
  WifiOff,
  RotateCcw
} from 'lucide-react'
import { EEGStreamChart } from '../components/EEGStreamChart'
import { BandPowerChart } from '../components/BandPowerChart'
import { cn } from '../utils/cn'

export const LiveStreamPage: React.FC = () => {
  const [isStreaming, setIsStreaming] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['Fz', 'Cz', 'Pz'])
  const [eegData, setEegData] = useState<any[]>([])
  const [bandPowerData, setBandPowerData] = useState<any>({})
  const wsRef = useRef<WebSocket | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const availableChannels = ['Fz', 'Cz', 'Pz', 'C3', 'C4', 'F3', 'F4', 'P3', 'P4']

  const connectWebSocket = () => {
    try {
      const ws = new WebSocket('ws://localhost/ws/stream')
      wsRef.current = ws

      ws.onopen = () => {
        setIsConnected(true)
        console.log('WebSocket connected')
      }

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.type === 'eeg_data' && data.data) {
          setEegData(prev => [...prev.slice(-100), data]) // Keep last 100 data points
          
          // Calculate band power for selected channels
          const newBandPower: any = {}
          selectedChannels.forEach(channel => {
            if (data.data[channel]) {
              // Simple band power calculation (in real app, this would be more sophisticated)
              const channelData = data.data[channel]
              const power = channelData.reduce((sum: number, val: number) => sum + val * val, 0) / channelData.length
              newBandPower[channel] = {
                delta: power * 0.2,
                theta: power * 0.15,
                alpha: power * 0.3,
                beta: power * 0.25,
                gamma: power * 0.1,
              }
            }
          })
          setBandPowerData(newBandPower)
        }
      }

      ws.onclose = () => {
        setIsConnected(false)
        console.log('WebSocket disconnected')
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setIsConnected(false)
      }
    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
    }
  }

  const startStream = () => {
    if (!isConnected) {
      connectWebSocket()
    }
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'start_stream' }))
    }
    
    // Simulate data generation
    intervalRef.current = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'generate_data' }))
      }
    }, 40) // 25 Hz update rate
    
    setIsStreaming(true)
  }

  const stopStream = () => {
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({ type: 'stop_stream' }))
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    
    setIsStreaming(false)
  }

  const disconnect = () => {
    stopStream()
    if (wsRef.current) {
      wsRef.current.close()
    }
    setEegData([])
    setBandPowerData({})
  }

  const resetData = () => {
    setEegData([])
    setBandPowerData({})
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Live EEG Stream
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Real-time neural signal monitoring and analysis.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <div className={cn(
              'flex items-center px-3 py-1 rounded-full text-xs font-medium',
              isConnected 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
            )}>
              {isConnected ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="btn btn-outline"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={startStream}
              disabled={isStreaming}
              className="btn btn-primary"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Stream
            </button>
            <button
              onClick={stopStream}
              disabled={!isStreaming}
              className="btn btn-secondary"
            >
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </button>
            <button
              onClick={disconnect}
              className="btn btn-outline"
            >
              <Square className="h-4 w-4 mr-2" />
              Disconnect
            </button>
            <button
              onClick={resetData}
              className="btn btn-outline"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </button>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <Activity className="h-4 w-4" />
            <span>{eegData.length} data points</span>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Stream Settings
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Channels
              </label>
              <div className="grid grid-cols-3 gap-2">
                {availableChannels.map((channel) => (
                  <label key={channel} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedChannels.includes(channel)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedChannels([...selectedChannels, channel])
                        } else {
                          setSelectedChannels(selectedChannels.filter(c => c !== channel))
                        }
                      }}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-900 dark:text-white">
                      {channel}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* EEG Signals */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            EEG Signals
          </h3>
          <div className="h-80">
            <EEGStreamChart 
              data={eegData} 
              channels={selectedChannels}
              isStreaming={isStreaming}
            />
          </div>
        </div>

        {/* Band Power */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Band Power
          </h3>
          <div className="h-80">
            <BandPowerChart 
              data={bandPowerData}
              channels={selectedChannels}
            />
          </div>
        </div>
      </div>

      {/* Channel Status */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Channel Status
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {selectedChannels.map((channel) => (
            <div key={channel} className="text-center">
              <div className="w-12 h-12 mx-auto bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mb-2">
                <Brain className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {channel}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isStreaming ? 'Active' : 'Inactive'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
