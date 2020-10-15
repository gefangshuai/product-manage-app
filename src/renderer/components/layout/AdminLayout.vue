<template>
    <div class="admin-layout">
        <div class="admin-layout-header">
            <slot name="header"></slot>
        </div>
        <div class="admin-layout-body">
            <slot></slot>
        </div>
        <div class="admin-layout-footer">
            <slot name="footer"></slot>
        </div>
    </div>
</template>

<script>
    export default {
        name: "AdminLayout"
    }
</script>

<style lang="less">
    .admin-layout {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        flex-direction: column;

        .admin-layout-header {
            height: 48px;
            line-height: 48px;
            padding: 0 18px;
            background: rgba(0, 0, 0, .05);
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        .admin-layout-footer {
            height: 48px;
            line-height: 48px;
            padding: 0 18px;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        .admin-layout-body {
            flex: 1;
            height: 100%;
            overflow: auto;
        }
    }
</style>