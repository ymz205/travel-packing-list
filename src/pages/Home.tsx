import { useState, useEffect } from 'react';
import { MapPin, Calendar, Sun, Briefcase, Heart, Mountain, Baby, ChevronDown, Zap } from 'lucide-react';
import { Season, TripType, TripConfig } from '../types';
import { searchDestinations, getAutoSeason } from '../services/aiEngine';
import { Destination } from '../types';
import { getDestinationsGroupedByInitial, DestinationWithPinyin } from '../data/itemDatabase';

interface HomeProps {
  store: ReturnType<typeof import('../stores/checklistStore').useChecklistStore>;
  onGenerate: () => void;
}

const seasonLabels: Record<Season, string> = {
  spring: '春',
  summer: '夏',
  autumn: '秋',
  winter: '冬',
  rainy: '雨季',
  dry: '旱季',
};

const tripTypeOptions: { type: TripType; label: string; icon: typeof Briefcase }[] = [
  { type: 'business', label: '商务', icon: Briefcase },
  { type: 'leisure', label: '休闲', icon: Sun },
  { type: 'outdoor', label: '户外', icon: Mountain },
  { type: 'family', label: '亲子', icon: Baby },
  { type: 'honeymoon', label: '蜜月', icon: Heart },
];

export default function Home({ store, onGenerate }: HomeProps) {
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState(3);
  const [season, setSeason] = useState<Season>(getAutoSeason());
  const [tripType, setTripType] = useState<TripType>('leisure');
  const [minimalMode, setMinimalMode] = useState(false);
  const [suggestions, setSuggestions] = useState<Destination[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [groupedDestinations, setGroupedDestinations] = useState<Record<string, DestinationWithPinyin[]>>({});

  useEffect(() => {
    setGroupedDestinations(getDestinationsGroupedByInitial());
  }, []);

  useEffect(() => {
    if (destination.length >= 1) {
      const results = searchDestinations(destination);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } else {
      setSuggestions([]);
    }
  }, [destination]);

  const handleSelectSuggestion = (dest: Destination) => {
    setDestination(dest.name);
    setShowSuggestions(false);
  };

  const handleGenerate = () => {
    if (!destination.trim()) return;
    
    const config: TripConfig = {
      destination: destination.trim(),
      days,
      season,
      tripType,
      minimalMode,
    };
    
    store.generateList(config);
    onGenerate();
  };

  const isFormValid = destination.trim().length > 0;

  return (
    <div className="min-h-screen pb-20 sm:pb-0">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-medium">1</div>
              <span className="text-gray-900 dark:text-white font-medium">行程配置</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 mx-3">
              <div className="h-full bg-primary w-0 transition-all" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 flex items-center justify-center">2</div>
              <span className="text-gray-500 dark:text-gray-400">生成清单</span>
            </div>
          </div>
        </div>

        {/* Destination Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            目的地
          </label>
          <div className="relative">
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="请输入城市或国家"
              className="w-full h-12 px-4 pl-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            
            {/* Suggestions Dropdown */}
            {(showSuggestions || destination.length === 0) && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 overflow-hidden max-h-80 overflow-y-auto">
                {destination.length > 0 && suggestions.length > 0 && (
                  <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50">
                    <span className="text-xs text-gray-500 dark:text-gray-400">搜索结果</span>
                  </div>
                )}
                
                {destination.length > 0 && suggestions.length > 0 && suggestions.map((dest, idx) => (
                  <button
                    key={idx}
                    onMouseDown={() => handleSelectSuggestion(dest)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">{dest.name}</span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">- {dest.country}</span>
                  </button>
                ))}
                
                {destination.length === 0 && Object.keys(groupedDestinations).sort().map(initial => (
                  <div key={initial}>
                    <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{initial}</span>
                    </div>
                    {groupedDestinations[initial].map((dest, idx) => (
                      <button
                        key={idx}
                        onMouseDown={() => handleSelectSuggestion(dest)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-900 dark:text-white text-sm">{dest.name}</span>
                        <span className="text-gray-500 dark:text-gray-400 text-xs">- {dest.country}</span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Days Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            出行天数
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="30"
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 min-w-[80px] justify-center">
              <span className="text-lg font-medium text-gray-900 dark:text-white">{days}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">天</span>
            </div>
          </div>
        </div>

        {/* Season Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Sun className="w-4 h-4 inline mr-1" />
            季节
          </label>
          <div className="relative">
            <select
              value={season}
              onChange={(e) => setSeason(e.target.value as Season)}
              className="w-full h-12 px-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
            >
              {Object.entries(seasonLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Trip Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Briefcase className="w-4 h-4 inline mr-1" />
            出行类型
          </label>
          <div className="flex flex-wrap gap-2">
            {tripTypeOptions.map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                onClick={() => setTripType(type)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${
                  tripType === type
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-primary'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Minimal Mode Toggle */}
        <div className="mb-8 flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">极简模式</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">精简至最小必要物品</div>
            </div>
          </div>
          <button
            onClick={() => setMinimalMode(!minimalMode)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              minimalMode ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                minimalMode ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={!isFormValid}
          className={`w-full h-14 rounded-lg font-bold text-lg transition-all ${
            isFormValid
              ? 'bg-primary text-white hover:bg-blue-600 shadow-lg shadow-primary/30'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
          }`}
        >
          生成清单
        </button>
      </div>
    </div>
  );
}