<template>
  <div>
    <TopBar :title="'Stake'" :subtitle="'Stake NOS and earn rewards'" ref="topBar" v-model="showSettingsModal" />
    <div class="notification is-warning is-light">
      <p>
        <strong>Notice:</strong>
        Following Nosana Network Proposal (NNP-0001), passive staking rewards are sunsetting.
        New stakes and stake top-ups are disabled.
        <template v-if="rewardsEndDate">
          Staking rewards {{ rewardsEndDate > new Date() ? 'will end' : 'ended' }} on
          <strong>{{ rewardsEndDate.toLocaleString(undefined, {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short'
          }) }}</strong>.
        </template>
        Read more
        <a href="https://vote.nosana.com/" target="_blank" rel="noopener">here</a>.
      </p>
    </div>
    <div class="columns is-multiline">
      <div class="column is-12 is-6-widescreen">
        <div class="box has-background-white-ter">
          <StakingForm />
        </div>
      </div>
      <div class="column is-12 is-6-widescreen">
        <StakingTestgrid />
        <div class="box has-background-white-ter">
          <StakingStats />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const showSettingsModal = ref(false);

// Pool info is fetched by useStake (in StakingForm) under this key
const { data: poolInfo } = useNuxtData<any>("getPoolInfo");

// Rewards stop once the pool vault is empty: start + (claimed + remaining) / emission per second
const rewardsEndDate = computed(() => {
  const pool = poolInfo.value;
  if (!pool || !pool.emission || pool.emission.isZero()) return null;
  const totalTokens = pool.claimedTokens.toNumber() + (pool.poolBalance ?? 0) * 1e6;
  return new Date((pool.startTime.toNumber() + totalTokens / pool.emission.toNumber()) * 1000);
});
</script>
