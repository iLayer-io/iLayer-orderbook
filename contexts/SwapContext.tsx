'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import {
    SwapState,
    SwapContextProps,
    TokenOrDefiToken,
    Quote,
    SettingsState,
} from '../types/swap';
import {
    adjustPercentagesToSum100,
    redistributePercentagesOnRemoval,
    calculateNewTokenPercentage,
    ensureValidPercentages
} from '../lib/percentage';

// Estendi le azioni del reducer
type SwapAction =
    | { type: 'UPDATE_INPUT_NETWORK'; payload: string }
    | { type: 'UPDATE_OUTPUT_NETWORK'; payload: string }
    | { type: 'UPDATE_INPUT_TOKENS'; payload: TokenOrDefiToken[] }
    | { type: 'UPDATE_OUTPUT_TOKENS'; payload: TokenOrDefiToken[] }
    | { type: 'UPDATE_INPUT_AMOUNT'; payload: { symbol: string; amount: string } }
    | { type: 'UPDATE_OUTPUT_AMOUNT'; payload: { symbol: string; amount: string } }
    | { type: 'UPDATE_OUTPUT_PERCENTAGES'; payload: { index: number; percentage: string } }
    | { type: 'INVERT_SWAP' }
    | { type: 'TOGGLE_ADVANCED_MODE' }
    | { type: 'OPEN_TOKEN_SELECTOR'; payload: { type: 'input' | 'output'; tokenId: string } }
    | { type: 'CLOSE_TOKEN_SELECTOR' }
    | { type: 'SET_SELECTED_CHAIN'; payload: string | null }
    | { type: 'SET_SEARCH_QUERY'; payload: string }
    | { type: 'SET_ACTIVE_TAB'; payload: 'token' | 'defi' }
    | { type: 'SET_SELECTED_PROTOCOL'; payload: string | null }
    | { type: 'SELECT_TOKEN'; payload: TokenOrDefiToken }
    | { type: 'SELECT_TOKEN_WITH_NETWORK_CHECK'; payload: { token: TokenOrDefiToken; tokenNetwork: string; advancedMode: boolean } }
    | { type: 'ADD_INPUT_TOKEN' }
    | { type: 'ADD_OUTPUT_TOKEN' }
    | { type: 'REMOVE_INPUT_TOKEN'; payload: string }
    | { type: 'REMOVE_OUTPUT_TOKEN'; payload: string }
    | { type: 'UPDATE_INPUT_TOKEN_AMOUNT'; payload: { tokenId: string; amount: string } }
    | { type: 'UPDATE_OUTPUT_TOKEN_AMOUNT'; payload: { tokenId: string; amount: string } }
    | { type: 'SET_QUOTES'; payload: Quote[] }
    | { type: 'SET_SELECTED_QUOTE'; payload: Quote | null }
    | { type: 'SET_IS_FETCHING_QUOTES'; payload: boolean }
    | { type: 'OPEN_SETTINGS' }
    | { type: 'CLOSE_SETTINGS' }
    | { type: 'UPDATE_SETTINGS'; payload: Partial<SettingsState> };

// Estendi lo stato iniziale
const initialState: SwapState & {
    advancedMode: boolean;
    tokenSelector: {
        isOpen: boolean;
        type: 'input' | 'output';
        editingTokenId: string;
        searchQuery: string;
        activeTab: 'token' | 'defi';
        selectedProtocol: string | null;
    };
    settings: SettingsState & { isOpen: boolean };
} = {
    input: {
        network: 'Arbitrum',
        tokens: [{
            symbol: 'ETH',
            amount: ''
        }],
    },
    output: {
        network: 'Arbitrum',
        tokens: [{
            symbol: 'USDT',
            amount: ''
        }],
    },
    outputPercentages: ['100'],
    advancedMode: false,
    selectedQuote: null,
    tokenSelector: {
        isOpen: false,
        type: 'input',
        editingTokenId: '',
        searchQuery: '',
        activeTab: 'token',
        selectedProtocol: null,
    },
    settings: {
        isOpen: false,
        swapDeadline: undefined,
        customRecipient: undefined,
        enableHook: false,
        hookTarget: undefined,
        gasLimit: 21000,
        calldata: undefined,
    },
};

// Estendi il reducer
const swapReducer = (
    state: typeof initialState,
    action: SwapAction
): typeof initialState => {
    switch (action.type) {
        case 'UPDATE_INPUT_TOKENS':
            return {
                ...state,
                input: {
                    ...state.input,
                    tokens: action.payload.map(token => ({ symbol: token.symbol, amount: '' })),
                },
            };

        case 'UPDATE_OUTPUT_TOKENS':
            return {
                ...state,
                output: {
                    ...state.output,
                    tokens: action.payload.map(token => ({ symbol: token.symbol, amount: '' })),
                },
                outputPercentages: new Array(action.payload.length).fill(0),
            };

        case 'UPDATE_INPUT_AMOUNT':
            return {
                ...state,
                input: {
                    ...state.input,
                    tokens: state.input.tokens.map(tokenWithAmount =>
                        tokenWithAmount.symbol === action.payload.symbol
                            ? { ...tokenWithAmount, amount: action.payload.amount }
                            : tokenWithAmount
                    ),
                },
            };

        case 'UPDATE_OUTPUT_AMOUNT':
            return {
                ...state,
                output: {
                    ...state.output,
                    tokens: state.output.tokens.map(tokenWithAmount =>
                        tokenWithAmount.symbol === action.payload.symbol
                            ? { ...tokenWithAmount, amount: action.payload.amount }
                            : tokenWithAmount
                    ),
                },
            };

        case 'UPDATE_OUTPUT_PERCENTAGES':
            const { index, percentage } = action.payload;
            const newPercentage = parseFloat(percentage) || 0;

            return {
                ...state,
                outputPercentages: adjustPercentagesToSum100(
                    state.outputPercentages,
                    index,
                    newPercentage,
                    state.output.tokens.length
                ),
            };

        case 'INVERT_SWAP':
            return {
                ...state,
                input: {
                    ...state.output,
                    tokens: state.output.tokens.map(token => ({
                        ...token,
                        amount: token.amount
                    }))
                },
                output: {
                    ...state.input,
                    tokens: state.input.tokens.map(token => ({
                        ...token,
                        amount: '' // Cancella gli importi dei token di output
                    }))
                },
            };

        case 'OPEN_TOKEN_SELECTOR':
            return {
                ...state,
                tokenSelector: {
                    ...state.tokenSelector,
                    isOpen: true,
                    type: action.payload.type,
                    editingTokenId: action.payload.tokenId,
                    searchQuery: '',
                    selectedProtocol: null,
                },
            };

        case 'CLOSE_TOKEN_SELECTOR':
            return {
                ...state,
                tokenSelector: {
                    ...state.tokenSelector,
                    isOpen: false,
                },
            };

        case 'SET_SEARCH_QUERY':
            return {
                ...state,
                tokenSelector: {
                    ...state.tokenSelector,
                    searchQuery: action.payload,
                },
            };

        case 'SET_ACTIVE_TAB':
            return {
                ...state,
                tokenSelector: {
                    ...state.tokenSelector,
                    activeTab: action.payload,
                    selectedProtocol: null,
                },
            };

        case 'SET_SELECTED_PROTOCOL':
            return {
                ...state,
                tokenSelector: {
                    ...state.tokenSelector,
                    selectedProtocol: action.payload,
                },
            };

        case 'SELECT_TOKEN':
            const { type, editingTokenId } = state.tokenSelector;
            const newState = { ...state };
            if (type === 'input') {
                // Update the specific input token at the given index
                newState.input = {
                    ...state.input,
                    tokens: state.input.tokens.map((token, index) =>
                        index.toString() === editingTokenId
                            ? { symbol: action.payload.symbol, amount: token.amount }
                            : token
                    )
                };
            } else {
                // Update the specific output token at the given index
                newState.output = {
                    ...state.output,
                    tokens: state.output.tokens.map((token, index) =>
                        index.toString() === editingTokenId
                            ? { symbol: action.payload.symbol, amount: token.amount }
                            : token
                    )
                };
            }

            newState.tokenSelector = {
                ...state.tokenSelector,
                isOpen: false,
            };

            return newState;

        case 'SELECT_TOKEN_WITH_NETWORK_CHECK': {
            const { token, tokenNetwork, advancedMode } = action.payload;
            const { type: selectorType, editingTokenId } = state.tokenSelector;
            const newState = { ...state };

            if (selectorType === 'input') {
                newState.input = {
                    ...state.input,
                    network: tokenNetwork,
                    tokens: state.input.tokens.map((t, index) =>
                        index.toString() === editingTokenId
                            ? { symbol: token.symbol, amount: t.amount }
                            : t
                    )
                };

                if (advancedMode && state.input.tokens.length > 1 && state.input.network !== tokenNetwork) {
                    const selectedTokenIndex = parseInt(editingTokenId);
                    newState.input = {
                        ...newState.input,
                        tokens: [{ symbol: token.symbol, amount: state.input.tokens[selectedTokenIndex].amount }]
                    };
                }
            } else {
                newState.output = {
                    ...state.output,
                    network: tokenNetwork,
                    tokens: state.output.tokens.map((t, index) =>
                        index.toString() === editingTokenId
                            ? { symbol: token.symbol, amount: t.amount }
                            : t
                    )
                };

                if (advancedMode && state.output.tokens.length > 1 && state.output.network !== tokenNetwork) {
                    const selectedTokenIndex = parseInt(editingTokenId);
                    newState.output = {
                        ...newState.output,
                        tokens: [{ symbol: token.symbol, amount: state.output.tokens[selectedTokenIndex].amount }]
                    };
                }
            }

            newState.tokenSelector = {
                ...state.tokenSelector,
                isOpen: false,
            };

            return newState;
        }

        case 'ADD_INPUT_TOKEN':
            return {
                ...state,
                input: {
                    ...state.input,
                    tokens: [...state.input.tokens, { symbol: '', amount: '' }]
                },

            };

        case 'ADD_OUTPUT_TOKEN':
            const newTokenPercentage = calculateNewTokenPercentage(
                state.outputPercentages,
                state.output.tokens.length
            );

            return {
                ...state,
                output: {
                    ...state.output,
                    tokens: [...state.output.tokens, { symbol: '', amount: '' }]
                },
                outputPercentages: [...state.outputPercentages, newTokenPercentage.toString()]
            };

        case 'REMOVE_INPUT_TOKEN':
            return {
                ...state,
                input: {
                    ...state.input,
                    tokens: state.input.tokens.filter((_, index) => index.toString() !== action.payload)
                }
            };

        case 'REMOVE_OUTPUT_TOKEN':
            const tokenIndex = parseInt(action.payload);
            const remainingTokens = state.output.tokens.filter((_, index) => index !== tokenIndex);

            return {
                ...state,
                output: {
                    ...state.output,
                    tokens: remainingTokens
                },
                outputPercentages: redistributePercentagesOnRemoval(
                    state.outputPercentages,
                    tokenIndex,
                    remainingTokens.length
                )
            };

        case 'TOGGLE_ADVANCED_MODE':
            const newAdvancedMode = !state.advancedMode;
            let newOutputPercentages = state.outputPercentages;

            // When enabling advanced mode, ensure percentages sum to 100
            if (newAdvancedMode && state.output.tokens.length > 1) {
                newOutputPercentages = ensureValidPercentages(
                    state.outputPercentages,
                    state.output.tokens.length
                );
            }

            return {
                ...state,
                advancedMode: newAdvancedMode,
                outputPercentages: newOutputPercentages,
                // Keep only first token if disabling advanced mode
                input: newAdvancedMode ? state.input : {
                    ...state.input,
                    tokens: state.input.tokens.slice(0, 1)
                },
                output: newAdvancedMode ? state.output : {
                    ...state.output,
                    tokens: state.output.tokens.slice(0, 1)
                }
            };

        case 'UPDATE_INPUT_TOKEN_AMOUNT':
            return {
                ...state,
                input: {
                    ...state.input,
                    tokens: state.input.tokens.map((tokenWithAmount, index) =>
                        index.toString() === action.payload.tokenId
                            ? { ...tokenWithAmount, amount: action.payload.amount }
                            : tokenWithAmount
                    )
                }
            };

        case 'UPDATE_OUTPUT_TOKEN_AMOUNT':
            return {
                ...state,
                output: {
                    ...state.output,
                    tokens: state.output.tokens.map((tokenWithAmount, index) =>
                        index.toString() === action.payload.tokenId
                            ? { ...tokenWithAmount, amount: action.payload.amount }
                            : tokenWithAmount
                    )
                }
            };

        case 'SET_SELECTED_QUOTE':
            return {
                ...state,
                selectedQuote: action.payload,
            };

        case 'OPEN_SETTINGS':
            return {
                ...state,
                settings: {
                    ...state.settings,
                    isOpen: true,
                },
            };

        case 'CLOSE_SETTINGS':
            return {
                ...state,
                settings: {
                    ...state.settings,
                    isOpen: false,
                },
            };

        case 'UPDATE_SETTINGS':
            return {
                ...state,
                settings: {
                    ...state.settings,
                    ...action.payload,
                },
            };

        default:
            return state;
    }
};

const SwapContext = createContext<SwapContextProps | undefined>(undefined);

interface SwapProviderProps {
    children: ReactNode;
}

export const SwapProvider: React.FC<SwapProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(swapReducer, initialState);


    const updateInputTokens = (tokens: TokenOrDefiToken[]) => {
        dispatch({ type: 'UPDATE_INPUT_TOKENS', payload: tokens });
    };

    const updateOutputTokens = (tokens: TokenOrDefiToken[]) => {
        dispatch({ type: 'UPDATE_OUTPUT_TOKENS', payload: tokens });
    };

    const updateInputAmount = (symbol: string, amount: string) => {
        dispatch({ type: 'UPDATE_INPUT_AMOUNT', payload: { symbol, amount } });
    };

    const updateOutputAmount = (symbol: string, amount: string) => {
        dispatch({ type: 'UPDATE_OUTPUT_AMOUNT', payload: { symbol, amount } });
    };

    const updateOutputPercentages = (index: number, percentage: string) => {
        dispatch({ type: 'UPDATE_OUTPUT_PERCENTAGES', payload: { index, percentage } });
    };

    const invertSwap = () => {
        dispatch({ type: 'INVERT_SWAP' });
    };

    const toggleAdvancedMode = () => {
        dispatch({ type: 'TOGGLE_ADVANCED_MODE' });
    };

    // Nuovi metodi per il token selector
    const openTokenSelector = (type: 'input' | 'output', tokenId: string) => {
        dispatch({ type: 'OPEN_TOKEN_SELECTOR', payload: { type, tokenId } });
    };

    const closeTokenSelector = () => {
        dispatch({ type: 'CLOSE_TOKEN_SELECTOR' });
    };

    const setSearchQuery = (query: string) => {
        dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
    };

    const setActiveTab = (tab: 'token' | 'defi') => {
        dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
    };

    const setSelectedProtocol = (protocol: string | null) => {
        dispatch({ type: 'SET_SELECTED_PROTOCOL', payload: protocol });
    };

    const selectToken = (token: TokenOrDefiToken) => {
        dispatch({ type: 'SELECT_TOKEN', payload: token });
    };

    const selectTokenWithNetworkCheck = (token: TokenOrDefiToken, tokenNetwork: string, advancedMode: boolean) => {
        dispatch({
            type: 'SELECT_TOKEN_WITH_NETWORK_CHECK',
            payload: { token, tokenNetwork, advancedMode }
        });
    };

    const addInputToken = () => {
        dispatch({ type: 'ADD_INPUT_TOKEN' });
    };

    const addOutputToken = () => {
        dispatch({ type: 'ADD_OUTPUT_TOKEN' });
    };

    const removeInputToken = (tokenId: string) => {
        dispatch({ type: 'REMOVE_INPUT_TOKEN', payload: tokenId });
    };

    const removeOutputToken = (tokenId: string) => {
        dispatch({ type: 'REMOVE_OUTPUT_TOKEN', payload: tokenId });
    };

    const updateInputTokenAmount = (tokenId: string, amount: string) => {
        dispatch({ type: 'UPDATE_INPUT_TOKEN_AMOUNT', payload: { tokenId, amount } });
    };

    const updateOutputTokenAmount = (tokenId: string, amount: string) => {
        dispatch({ type: 'UPDATE_OUTPUT_TOKEN_AMOUNT', payload: { tokenId, amount } });
    };

    const setSelectedQuote = (quote: Quote | null) => {
        dispatch({ type: 'SET_SELECTED_QUOTE', payload: quote });
    };

    const openSettings = () => {
        dispatch({ type: 'OPEN_SETTINGS' });
    };

    const closeSettings = () => {
        dispatch({ type: 'CLOSE_SETTINGS' });
    };

    const updateSettings = (settings: Partial<SettingsState>) => {
        dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
    };

    const value: SwapContextProps = {
        swapData: {
            input: state.input,
            output: state.output,
            outputPercentages: state.outputPercentages,
            advancedMode: state.advancedMode,
            selectedQuote: state.selectedQuote,
        },
        updateInputTokens,
        updateOutputTokens,
        updateInputAmount,
        updateOutputAmount,
        updateOutputPercentages,
        invertSwap,
        toggleAdvancedMode,
        // Quote management
        selectedQuote: state.selectedQuote,
        advancedMode: state.advancedMode,
        setSelectedQuote,
        tokenSelector: state.tokenSelector,
        openTokenSelector,
        closeTokenSelector,
        setSearchQuery,
        setActiveTab,
        setSelectedProtocol,
        selectToken,
        selectTokenWithNetworkCheck,
        addInputToken,
        addOutputToken,
        removeInputToken,
        removeOutputToken,
        updateInputTokenAmount,
        updateOutputTokenAmount,
        settings: state.settings,
        openSettings,
        closeSettings,
        updateSettings,
    };

    return <SwapContext.Provider value={value}>{children}</SwapContext.Provider>;
};

export const useSwap = (): SwapContextProps => {
    const context = useContext(SwapContext);
    if (context === undefined) {
        throw new Error('useSwap must be used within a SwapProvider');
    }
    return context;
};
