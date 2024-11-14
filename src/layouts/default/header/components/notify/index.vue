<template>
  <div :class="prefixCls"> </div>
</template>
<script lang="ts" setup>
  import { computed, ref } from 'vue'
  import { Popover, Tabs, Badge } from 'ant-design-vue'
  import { BellOutlined } from '@ant-design/icons-vue'
  import { tabListData, ListItem } from './data'
  import NoticeList from './NoticeList.vue'
  import { useDesign } from '@/hooks/web/useDesign'
  import { useMessage } from '@/hooks/web/useMessage'

  const { prefixCls } = useDesign('header-notify')
  const { createMessage } = useMessage()
  const listData = ref(tabListData)
  const numberStyle = {}

  const count = computed(() => {
    let count = 0
    for (let i = 0; i < tabListData.length; i++) {
      count += tabListData[i].list.length
    }
    return count
  })

  function onNoticeClick(record: ListItem) {
    createMessage.success('你点击了通知，ID=' + record.id)
    // 可以直接将其标记为已读（为标题添加删除线）,此处演示的代码会切换删除线状态
    record.titleDelete = !record.titleDelete
  }
</script>
<style lang="less">
  @prefix-cls: ~'@{namespace}-header-notify';

  .@{prefix-cls} {
    padding-bottom: 1px;

    &__overlay {
      max-width: 360px;
    }

    .ant-tabs-content {
      width: 300px;
    }

    .ant-badge {
      display: flex;
      align-items: center;
      font-size: 18px;

      .ant-badge-multiple-words {
        padding: 0 4px;
      }

      svg {
        width: 0.9em;
      }
    }
  }
</style>
