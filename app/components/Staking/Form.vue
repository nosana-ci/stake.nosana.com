<template>
  <form @submit.prevent>
    <div class="box">
      <div class="tabs is-fullwidth is-size-4">
        <ul>
          <li :class="{ 'is-active': tab === 'stake' && !(activeStake && stakeEndDate) }">
            <a :class="{ 'is-disabled': activeStake && stakeEndDate }" @click="tab = 'stake'"
              class="is-justify-content-flex-start">STAKE</a>
          </li>
          <li :class="{ 'is-active': tab === 'unstake' || (activeStake && stakeEndDate) }">
            <a @click="tab = 'unstake'" class="is-justify-content-flex-start"
              :class="{ 'is-disabled': !activeStake || !activeStake.address }">UNSTAKE</a>
          </li>
        </ul>
      </div>
      <div class="my-2" v-if="connected">
        <div v-if="loadingStake">Loading...</div>
        <div v-else-if="errorStake" class="has-text-danger">
          <p>Error fetching stake account.
            <a class="has-text-danger" @click="refreshStake"><u><b>Retry</b></u></a>
          </p>
        </div>
      </div>
      <div v-if="tab === 'stake' && !stakeEndDate">
        <p class="my-4" v-if="!activeStake || !activeStake.address">
          New stakes are no longer possible, as passive staking rewards are sunsetting.
        </p>
        <!-- Show reward account warning if address is in list & reward account doesn't exists -->
        <div v-if="
          activeStake &&
          stakesWithoutRewardAccount.includes(activeStake.address) &&
          rewardsInfo &&
          !rewardsInfo.vault" class="notification is-warning is-light">
          <p class="is-size-5 mb-4">
            You have an active stake, but there is no reward account found. <br>
            To fix this create a reward account with the button below to start receiving $NOS rewards.
            Contact the Nosana team for further details.
          </p>
          <button class="button mt-2 is-fullwidth is-primary is-large" @click.prevent="createRewardAccount()"
            :class="{ 'is-loading': loading }">
            Create Reward Account
          </button>
        </div>
        <!-- Your stake block -->
        <div v-if="activeStake && activeStake.address">
          <p class="has-text-black is-uppercase mb-4">Your stake</p>
          <div class="columns is-multiline">
            <div class="column is-4 mb-">
              <label class="label is-size-6 mb-0">NOS Staked</label>
              <div class="has-text-black is-size-3">
                <CustomCountUp :end-val="(activeStake.amount / 1e6)" :decimal-places="2">
                </CustomCountUp>
              </div>
            </div>
            <div class="column is-4">
              <label class="label mb-0">Multiplier</label>
              <div class="has-text-black is-size-3">
                <CustomCountUp :end-val="multiplier" :decimal-places="2">
                  <template #prefix>
                    <span>x</span>
                  </template>
                </CustomCountUp>
              </div>
            </div>
            <div class="column is-4">
              <label class="label mb-0">xNOS</label>
              <div class="has-text-black is-size-3">
                <CustomCountUp v-if="xNOS !== null" :end-val="xNOS">
                </CustomCountUp>
              </div>
            </div>
            <div class="column is-4">
              <label class="label mb-0">Unstake period of</label>
              <div class="has-text-black is-flex is-align-items-center">
                <div><span class="is-size-3">{{ unstakeDays }}</span> days</div>
              </div>
            </div>
            <div class="column is-4">
              <label class="label mb-0">APY</label>
              <div class="has-text-black is-size-3">
                <CustomCountUp v-if="APY !== null" :end-val="APY" :decimal-places="1">
                  <template #suffix>
                    <span>%</span>
                  </template>
                </CustomCountUp>
              </div>
            </div>
            <div class="column is-4">
              <label class="label mb-0">Daily NOS rewards</label>
              <div class="has-text-black is-size-3">
                <CustomCountUp v-if="expectedRewards !== null" :end-val="expectedRewards" :decimal-places="2">
                </CustomCountUp>
              </div>
            </div>
          </div>
        </div>
      </div>
      <StakingUnstake v-else-if="tab === 'unstake' || stakeEndDate" />
    </div>
    <StakingPendingRewards v-if="activeStake && activeStake.address && !stakeEndDate" />
    <ClientOnly>
      <wallet-modal-provider v-if="!connected" :dark="$colorMode.value === 'dark'">
        <template #default="modalScope">
          <a class="button is-fullwidth is-primary is-large" @click="modalScope.openModal()">
            Connect Wallet
          </a>
        </template>
      </wallet-modal-provider>
    </ClientOnly>
  </form>
</template>

<script lang="ts" setup>
import { WalletModalProvider, useWallet } from "solana-wallets-vue";
import { useToast } from "vue-toastification";

const toast = useToast();
const { connected, publicKey } = useWallet();
const { rewardsInfo, unstakeDays, activeStake, poolInfo, refreshStake, refreshBalance,
  loadingStake, errorStake } = useStake(publicKey);
const { nosana } = useSDK();
const SECONDS_PER_DAY = 24 * 60 * 60;

const loading: Ref<boolean> = ref(false);
const amount: Ref<number | null> = ref(null);
const extraUnstakeDays: Ref<number> = ref(0);
const tab: Ref<string> = ref('stake');
const newUnstakeDays: Ref<number> = ref(14);
const stakesWithoutRewardAccount = ref([
  'HUuiuxCmrYFZx8riSrStAzGv3ZpqgAjXx51a35xcRRsT',
  'Efx77rVMgUP5AQEeiNEnzuCdcckK5qQUDPeJ6wZStWGo',
  'DCVMG5Pub1SckQRKLhsdTUbFrhM5QXaAr8ah62VgxvtK',
  '7rzHNGGyvZBTy4eprTAtwsLfhWncZPMsmqxvUbhXK4Vb',
  'HMZdymumUcxnJHbqShPj7SeBjePoSdJshHcRuAJ1Tk3m',
  '4DEzPsgde8JRoHaquWMX1tmbaDSWArzpeR1z8A6iwaGM',
  '34HZW9e7oejnMUi56hAdCkkyuyZnnSVg2BHfW3K7qiMD',
  'GqnEJtRXezyYrZzCHpMMyymW3SJifE7DDB7SATbzrdpL',
  'EuUqi98wsumcfxMvYbR7Xd7gpLBdiuBgDUU64jHMJ5dC',
  '3N6LxjWPe7LQuqrueoSMKm1BFBTPFSinrY3EQgL5Vh1T',
  '3NbuLEPFpCSubCiVgkBvnLevaAg4R6pKd1V1vbcc8jBx',
  '8iiV4xAXxZj135tBRtxHDDaspbTCwnMTcgpGujKpf3RY',
  '5DScvc6atvFvfkQBsWD9A6qxhfAJqfnhjvH3FZLmSqTv',
  'BoEh9JTFEiFwzX5QXQDT5xxZsm4DVDFo1TNbox9cyhvW',
  '5s4STD8V8AooefGf6VBdA32frqXytX2UdEuHFvvKz6Y9',
  '7BpcjAmG8A2G412QDww4QnkVPcRRgxqaFhzAQVV9xaG5',
  '2XofmYToG9caMt1PkKzQQB9jLywWLR34LLG1wM6sBXze',
  'FR4LHhpLAPDBwawZJsU4RdYiuPaFHgLLaZhnjE3p5JYo',
  '7W8zxJDkNdM219WejmMvfiH5cE8TRVPg1E1FeWXBCY8J',
  '4f94CU5KSPnc5C3QdE3cCG7wnEhQCfbBodwEMEYc8qSW',
  'EiH61gDJTaa81P6cLHZLZjGgGNpGtXw1V6VNQdBfsLFX',
  'Dvtai7nF1nb78KHUAtrDC2PduGsZaEDgchYFa1XPLZUr',
  '8j9ounoWkCWyX9Uhi6x14q9R79yddTukEPbp7m7f9MD2',
  'DmzckmHiaWvoxarKXS3Hcxr7hcz6XRY7QQy76JEJUk5Z',
  '9B5wDHGZmL2HHyFXx11F9KaiAqyv77fiUr6xqfanmCzS',
  'EkzeYfXPZpzMKyLnXTCBNQ8arEuZtz1ytjP7Tc7XiWoy'
]);

const multiplier: ComputedRef<number> = computed(() => {
  const days = extraUnstakeDays.value > 0 ? extraUnstakeDays.value + unstakeDays.value : (unstakeDays.value ? unstakeDays.value : newUnstakeDays.value);
  let unstakeTime;
  unstakeTime = days * SECONDS_PER_DAY;
  const multiplierSeconds = (SECONDS_PER_DAY * 365) / 3; // 4 months
  const multiplier = unstakeTime / multiplierSeconds;
  return multiplier + 1;
})

const xNOS: ComputedRef<number | null> = computed(() => {
  const formAmount = amount.value ? amount.value : 0;
  const score = activeStake.value && activeStake.value.amount ?
    (formAmount + (activeStake.value.amount / 1e6)) * multiplier.value :
    formAmount * multiplier.value;
  return Math.max(0, score);
})

const APY: ComputedRef<number | null> = computed(() => {
  if (expectedRewards.value) {
    const apy = (
      (expectedRewards.value * 365) / ((activeStake.value && activeStake.value.amount
        ? (activeStake.value.amount / 1e6) : 0) + (amount.value ? amount.value : 0)) * 100)
    return apy;
  }
  return null;
})


const expectedRewards: ComputedRef<number | null> = computed(() => {
  if (!rewardsInfo.value || !poolInfo.value) { return null; }

  let totalXnos = parseFloat(rewardsInfo.value.global.totalXnos);
  if (activeStake.value && activeStake.value.amount) {
    totalXnos -= activeStake.value.amount;
  }
  const xnosScore = (xNOS.value ?? 0) * 1e6;
  const rewards = (xnosScore / (totalXnos + xnosScore)) * ((poolInfo.value.emission.toNumber() / 1e6) * SECONDS_PER_DAY)
  return Math.max(0, rewards);
})

const stakeEndDate: ComputedRef<any> = computed(() => {
  return activeStake.value && parseInt(activeStake.value.time_unstake) > 0 ? Number(activeStake.value.time_unstake) + Number(unstakeDays.value * 24 * 60 * 60) : null;
});

// Staking methods
const createRewardAccount = async () => {
  const createRewardAccount = await nosana.value.stake.createRewardAccount();
  await refreshStake();
  await refreshBalance();
  toast.success('Succesfully created reward account');
  if (import.meta.dev) console.debug('create reward account tx', createRewardAccount);
}
</script>

