import { useEffect, useState, useCallback, useRef } from 'react';
import {
  useWaku,
  useLightPush,
  useFilterMessages,
  useContentPair
} from '@waku/react';
import { useSwap } from '@/contexts/SwapContext';
import { useConfig } from '@/contexts/ConfigContext';
import { LightNode } from '@waku/sdk';
import { getRequestType, getResponseType } from '@/config/waku';
import { safeParseFloat } from '@/lib/utils';
import { Quote } from '@/types/swap';

export const AUTO_REFRESH_INTERVAL = 60000; // 60 secondi
const QUOTE_TIMEOUT = 2000; // 2 secondi per ascoltare i messaggi
export const MAX_QUOTES = 3; // Limite massimo di quote da mostrare

export function useWakuQuotes() {
  const { swapData, setSelectedQuote, updateOutputAmount } = useSwap();
  const { getTokenByChainAndAddress } = useConfig();
  const { getTokenBySymbol } = useConfig();

  // Usa il hook useWaku per gestire il nodo
  const {
    node,
    error: wakuError,
    isLoading: wakuLoading
  } = useWaku<LightNode>();

  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  // Nuovi stati per il countdown e refresh automatico
  const [countdown, setCountdown] = useState<number>(0);
  const [isAutoRefreshActive, setIsAutoRefreshActive] =
    useState<boolean>(false);
  const [hasInitialRefresh, setHasInitialRefresh] = useState<boolean>(false);

  // Refs per gestire i timer
  const autoRefreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Genera un ID basato sui token di input e output per rilevare i cambiamenti
  const generateInputTokensId = useCallback((): string => {
    try {
      const inputData = {
        input: {
          network: swapData.input.network,
          tokens: swapData.input.tokens
            .filter((tokenWithAmount) => {
              const token = getTokenBySymbol(
                swapData.input.network,
                tokenWithAmount.symbol
              );
              return token && safeParseFloat(tokenWithAmount.amount) > 0;
            })
            .map((tokenWithAmount) => ({
              symbol: tokenWithAmount.symbol,
              amount: safeParseFloat(tokenWithAmount.amount)
            }))
            .sort((a, b) => a.symbol.localeCompare(b.symbol)) // Ordina per consistenza
        },
        output: {
          network: swapData.output.network,
          tokens: swapData.output.tokens
            .filter((tokenWithAmount) => {
              const token = getTokenBySymbol(
                swapData.output.network,
                tokenWithAmount.symbol
              );
              return token;
            })
            .map((tokenWithAmount) => ({
              symbol: tokenWithAmount.symbol
            }))
            .sort((a, b) => a.symbol.localeCompare(b.symbol)) // Ordina per consistenza
        }
      };

      return JSON.stringify(inputData);
    } catch (error) {
      console.error('Error generating input tokens ID:', error);
      return '';
    }
  }, [
    swapData.input.network,
    swapData.input.tokens,
    swapData.output.network,
    swapData.output.tokens,
    getTokenBySymbol
  ]);

  // Memorizza l'ID corrente dei token di input e output
  const currentInputTokensId = generateInputTokensId();
  const prevInputTokensIdRef = useRef<string>('');

  const { encoder, decoder } = useContentPair();

  // Usa useLightPush per inviare messaggi
  const { push } = useLightPush({ node, encoder });

  // Usa useFilterMessages per ricevere risposte
  const { messages: filterMessages } = useFilterMessages({ node, decoder });

  // Funzione per pulire tutti i timer
  const clearAllTimers = useCallback(() => {
    if (autoRefreshTimerRef.current) {
      clearTimeout(autoRefreshTimerRef.current);
      autoRefreshTimerRef.current = null;
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
      messageTimeoutRef.current = null;
    }
  }, []);

  // Funzione per avviare il countdown
  const startCountdown = useCallback(() => {
    setCountdown(AUTO_REFRESH_INTERVAL / 1000); // 60 secondi
    setIsAutoRefreshActive(true);

    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Funzione per fermare il countdown
  const stopCountdown = useCallback(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setCountdown(0);
    setIsAutoRefreshActive(false);
  }, []);

  // Gestisci le risposte in arrivo - ora sovrascrive sempre la lista
  useEffect(() => {
    if (filterMessages.length === 0) return;

    const newQuotes: Quote[] = [];

    filterMessages.slice(-MAX_QUOTES).forEach((message, index) => {
      try {
        if (!message.payload) return;

        const response = getResponseType().decode(message.payload).toJSON();

        const quote: Quote = {
          id: generateInputTokensId() + `-${index}`,
          solver: response.solver,
          inputTokens: response.from.tokens.map((token: any) => ({
            address: token.address,
            amount: token.amount,
            symbol:
              getTokenByChainAndAddress(response.from.network, token.address)
                ?.symbol || 'N/A'
          })),
          outputTokens: response.to.tokens.map((token: any, index: number) => {
            // TODO: remove mock
            const mockedUSDAmounts = swapData.input.tokens.flatMap((t) => {
              let mockedAmount;
              const inputTokenAmount = safeParseFloat(t.amount);
              switch (t.symbol) {
                case 'ETH': {
                  mockedAmount = inputTokenAmount * 3838.33;
                  break;
                }
                case 'ARB': {
                  mockedAmount = inputTokenAmount * 0.5088;
                  break;
                }
                default:
                  mockedAmount = 0;
              }

              return [mockedAmount];
            });

            return {
              address: token.address,
              amount: mockedUSDAmounts[index],
              symbol:
                getTokenByChainAndAddress(response.to.network, token.address)
                  ?.symbol || 'N/A'
            };
          }),
          network: {
            from: response.from.network,
            to: response.to.network
          },
          // Campi calcolati per compatibilità
          source: `Solver-${response.solver.substring(0, 8)}`,
          sourceLogo: '/default-solver-logo.png',
          timeEstimate: '~30s',
          isError: false,
          isPositive: true,
          isBest: false
        };

        if (
          quote.inputTokens.some(
            (t) =>
              !swapData.input.tokens.find((input) => input.symbol === t.symbol)
          ) ||
          quote.outputTokens.some(
            (t) =>
              !swapData.output.tokens.find(
                (output) => output.symbol === t.symbol
              )
          ) ||
          quote.network.from !== swapData.input.network ||
          quote.network.to !== swapData.output.network
        ) {
          console.warn(
            `Quote ${quote.id} does not match current swap configuration, skipping`
          );
          return;
        }

        newQuotes.push(quote);
      } catch (error) {
        console.error('Error decoding quote response:', error);
      }
    });

    if (newQuotes.length > 0) {
      // Calcola valori USD e ordina i quote
      const quotesWithCalculations = newQuotes.map((quote, index) => {
        const totalInputValue = quote.inputTokens.reduce(
          (sum, token) => sum + token.amount,
          0
        );
        const totalOutputValue = quote.outputTokens.reduce(
          (sum, token) => sum + token.amount,
          0
        );

        return {
          ...quote,
          inputValueUSD: totalInputValue.toString(),
          outputValueUSD: totalOutputValue.toString(),
          estimatedAfterGas: (totalOutputValue * 0.97).toString(), // Stima dopo gas
          percentage: ((totalOutputValue / totalInputValue - 1) * 100).toFixed(
            2
          ),
          isPositive: totalOutputValue >= totalInputValue
        };
      });

      const sortedQuotes = quotesWithCalculations.sort(
        (a, b) =>
          safeParseFloat(b.outputValueUSD!) - safeParseFloat(a.outputValueUSD!)
      );

      if (sortedQuotes.length > 0) {
        sortedQuotes[0].isBest = true;
      }

      // Sovrascrive sempre la lista invece di accumulare
      setQuotes(sortedQuotes);

      // Pulisci il timeout dei messaggi se abbiamo ricevuto risposte
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
        messageTimeoutRef.current = null;
      }

      console.log(
        `Received ${newQuotes.length} quotes from Waku - list updated`
      );
    }
  }, [
    filterMessages,
    isAutoRefreshActive,
    startCountdown,
    getTokenByChainAndAddress
  ]);

  const shouldFetchQuotes = useCallback((): boolean => {
    try {
      const hasValidInputs = swapData.input.tokens.some(
        (tokenWithAmount) =>
          getTokenBySymbol(swapData.input.network, tokenWithAmount.symbol) &&
          safeParseFloat(tokenWithAmount.amount) > 0
      );

      const hasValidOutputs = swapData.output.tokens.some((tokenWithAmount) =>
        getTokenBySymbol(swapData.output.network, tokenWithAmount.symbol)
      );

      return hasValidInputs && hasValidOutputs;
    } catch (error) {
      console.error('Error in shouldFetchQuotes:', error);
      return false;
    }
  }, [swapData.input.tokens, swapData.output.tokens, getTokenBySymbol]);

  const fetchQuotesFromWaku = useCallback(async () => {
    if (!node || !push || wakuLoading) {
      console.log('Waku not ready for sending messages');
      return;
    }

    try {
      console.log('Fetching quotes from Waku...');
      setIsFetching(true);

      // Reset della lista dei quotes all'inizio di ogni fetch
      setQuotes([]);
      setSelectedQuote(null);

      const bucketId = `user-${Date.now()}`;

      const validInputTokens = swapData.input.tokens.filter(
        (tokenWithAmount) => {
          const token = getTokenBySymbol(
            swapData.input.network,
            tokenWithAmount.symbol
          );
          return token && safeParseFloat(tokenWithAmount.amount) > 0;
        }
      );

      const validOutputTokens = swapData.output.tokens.filter(
        (tokenWithAmount) => {
          const token = getTokenBySymbol(
            swapData.output.network,
            tokenWithAmount.symbol
          );
          return token;
        }
      );

      // Costruisci la richiesta con la nuova struttura
      const quoteRequest = {
        bucket: bucketId,
        from: {
          network: swapData.input.network,
          tokens: validInputTokens.map((tokenWithAmount) => {
            const token = getTokenBySymbol(
              swapData.input.network,
              tokenWithAmount.symbol
            );
            return {
              address: token?.address || '',
              weight: Math.floor(safeParseFloat(tokenWithAmount.amount)) // Converti in int32
            };
          })
        },
        to: {
          network: swapData.output.network,
          tokens: validOutputTokens.map((tokenWithAmount, index) => {
            const token = getTokenBySymbol(
              swapData.output.network,
              tokenWithAmount.symbol
            );
            const percentage = swapData.outputPercentages[index] || 0;
            return {
              address: token?.address || '',
              weight: Math.floor(percentage) // Converti la percentuale in peso int32
            };
          })
        }
      };

      // Invia la richiesta utilizzando useLightPush
      const payload = getRequestType().encode(quoteRequest).finish();
      const { failures } = await push({
        payload
      });

      if (failures.length > 0) {
        console.error('Errors sending quote request:', failures);
        setIsFetching(false);
        return;
      }

      console.log('Quote request sent, listening for responses...');

      // Imposta un timeout per fermare l'ascolto dei messaggi dopo QUOTE_TIMEOUT
      messageTimeoutRef.current = setTimeout(() => {
        setIsFetching(false);
        // Avvia il countdown per il prossimo refresh automatico
        if (!isAutoRefreshActive) {
          startCountdown();
        }
        console.log('Quote listening timeout - stopping message reception');
      }, QUOTE_TIMEOUT);
    } catch (error) {
      console.error('Error fetching quotes from Waku:', error);
      setQuotes([]);
      setIsFetching(false);
    }
  }, [node, push, wakuLoading, swapData, getTokenBySymbol]);

  const handleSelectQuote = useCallback(
    (quote: Quote) => {
      console.log('Selected quote:', quote);
      setSelectedQuote(quote);

      // Aggiorna gli output amounts basandosi sui token address della risposta
      quote.outputTokens.forEach((quoteToken, index) => {
        const outputToken = swapData.output.tokens[index];
        if (outputToken) {
          // Trova il token corrispondente per symbol usando l'address
          const tokenByAddress = getTokenBySymbol(
            swapData.output.network,
            outputToken.symbol
          );
          if (tokenByAddress && tokenByAddress.address === quoteToken.address) {
            updateOutputAmount(
              outputToken.symbol,
              quoteToken.amount.toString()
            );
            console.log(
              `Updated ${outputToken.symbol} to ${quoteToken.amount}`
            );
          }
        }
      });
    },
    [swapData.output.tokens, updateOutputAmount, getTokenBySymbol]
  );

  const refreshQuotes = useCallback(() => {
    if (!isFetching && node) {
      // Reset del countdown al refresh manuale
      stopCountdown();
      fetchQuotesFromWaku();
    }
  }, [isFetching, node, fetchQuotesFromWaku, stopCountdown]);

  // Effetto per il refresh automatico quando il countdown raggiunge 0
  useEffect(() => {
    if (countdown === 0 && isAutoRefreshActive && !isFetching) {
      console.log('Auto-refreshing quotes...');
      stopCountdown();
      fetchQuotesFromWaku();
    }
  }, [
    countdown,
    isAutoRefreshActive,
    isFetching,
    fetchQuotesFromWaku,
    stopCountdown
  ]);

  // Effetto per il primo refresh quando vengono inseriti input/output validi o quando cambiano
  useEffect(() => {
    const shouldFetch = shouldFetchQuotes();
    const tokenConfigChanged =
      currentInputTokensId !== prevInputTokensIdRef.current;

    if (shouldFetch && tokenConfigChanged && !isFetching) {
      console.log(
        'Input/Output tokens changed, triggering fetchQuotesFromWaku...'
      );
      console.log('Previous ID:', prevInputTokensIdRef.current);
      console.log('Current ID:', currentInputTokensId);

      // Ferma il countdown corrente prima di fare il fetch
      stopCountdown();

      setHasInitialRefresh(true);
      prevInputTokensIdRef.current = currentInputTokensId;
      fetchQuotesFromWaku();
    } else if (!shouldFetch) {
      setHasInitialRefresh(false);
      prevInputTokensIdRef.current = '';
      stopCountdown();
      setQuotes([]);
    }
  }, [
    currentInputTokensId,
    shouldFetchQuotes,
    isFetching,
    fetchQuotesFromWaku,
    stopCountdown
  ]);

  // Cleanup al unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  const hasZeroAmountInput =
    swapData.input.tokens.some(
      (tokenWithAmount) =>
        !getTokenBySymbol(swapData.input.network, tokenWithAmount.symbol) ||
        safeParseFloat(tokenWithAmount.amount) === 0
    ) ||
    swapData.output.tokens.length === 0 ||
    swapData.output.tokens.some(
      (tokenWithAmount) =>
        !getTokenBySymbol(swapData.output.network, tokenWithAmount.symbol)
    );

  const wakuInitialized = node && !wakuLoading && !wakuError;

  return {
    quotes,
    isFetching,
    hasZeroAmountInput,
    selectedQuote: swapData.selectedQuote,
    handleSelectQuote,
    refreshQuotes,
    wakuInitialized,
    wakuError,
    // Nuovi valori esposti per l'UI
    countdown,
    isAutoRefreshActive,
    // ID per il debugging dei cambiamenti input/output
    currentInputTokensId
  };
}
