import { Client, type ClientConfig } from "@nosana/sdk";
import { useCookies } from '@vueuse/integrations/useCookies'
import {
  useAnchorWallet,
  type AnchorWallet,
  useWallet,
} from "solana-wallets-vue";

const config = useRuntimeConfig();

const prioFee = useLocalStorage("prio-fee", {
  strategy: "medium",
  staticFee: 100000,
  dynamicPriorityFee: true,
  maxPriorityFee: 15000000,
});

const nosana = computed(() => {
  // Include wallet connection state to trigger reactivity when wallet connects/disconnects
  const { connected, publicKey } = useWallet();
  
  let wallet: Ref<AnchorWallet | undefined>;

  try {
    wallet = useAnchorWallet();
  } catch (error) {
    wallet = ref(undefined);
  }

  // Ensure we have both connection state and wallet before creating client
  const walletValue = connected.value && publicKey.value && wallet?.value ? wallet.value : undefined;

  const solanaConfig = {
    network: config.public.rpcUrl,
    priority_fee: prioFee.value?.staticFee ?? 100000,
    dynamicPriorityFee: prioFee.value?.dynamicPriorityFee ?? true,
    priorityFeeStrategy:
      prioFee.value?.strategy === "disable"
        ? "medium"
        : prioFee.value?.strategy ?? "medium",
  } as unknown as ClientConfig["solana"];

  const clientConfig: ClientConfig = {
    solana: solanaConfig,
    api: {
      backend_url: config.public.apiBase,
    },
  };

  const network = (config.public.network === "devnet" || config.public.network === "mainnet")
    ? config.public.network
    : "mainnet";
  const client = new Client(network, walletValue, clientConfig as ClientConfig);

  return client;
});

export const useSDK = () => {
  return { nosana, prioFee };
};
