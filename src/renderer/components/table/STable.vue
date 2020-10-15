<template>
    <div class="s-table" ref="tableRef">
        <a-table
            v-bind="defaultConfig"
            v-if="columns.length > 0"
            :locale="{emptyText: emptyText, filterConfirm: '确定', filterReset: '重置'}"
            :scroll="{ x: scrollX, y: scrollY }"
            :columns="columns"
            @change="handleChange"
        ></a-table>
        <slot></slot>
    </div>
</template>

<script>
    import {Table} from 'ant-design-vue'
    import _isNumber from 'lodash/isNumber'
    import clearObj from "@gefangshuai/frontend-utils/js/object/clearObj";

    export default {
        name: "STable",
        components: {ATable: Table},
        props: {
            config: Object,
            offsetHeight: {
                type: Number,
                default: 0
            },
            autoHeight: {
                type: [Boolean, Number],
                default: false
            },
            emptyText: {
                type: String,
                default: "暂无数据"
            }
        },
        data() {
            return {
                columns: [],
                scrollY: 0,
                defaultConfig: {
                    dataSource: []
                }
            }
        },
        created() {
            this.defaultConfig = Object.assign({}, this.defaultConfig, this.config)
        },
        mounted() {
            this.parseColumns();
            if (this.autoHeight) {
                this.getScrollY()
                window.addEventListener('resize', this.getScrollY)
            }

        },
        watch: {
            'defaultConfig.dataSource'() {
                if (this.autoHeight) {
                    this.getScrollY()
                }
            },
            config: {
                handler() {
                    this.defaultConfig = Object.assign({}, this.defaultConfig, this.config)
                }
            },
        },
        computed: {
            scrollX() {
                let width = 0
                this.columns.forEach(c => {
                    width += (c.width || 100)
                })
                return width;
            },
            slotColumns() {
                return this.$slots.default
            }
        },
        methods: {
            getScrollY() {
                this.$nextTick(() => {
                    setTimeout(_ => {
                        let parent = this.$el.parentElement
                        if (parent) {
                            let rect = parent.getBoundingClientRect()
                            let scrollY
                            if (_isNumber(this.autoHeight)) {
                                scrollY = this.autoHeight
                            } else {
                                scrollY = this.defaultConfig.pagination ? rect.height - (this.offsetHeight || 120) : rect.height - (this.offsetHeight || 80)
                            }
                            this.scrollY = scrollY
                        }
                    }, 10)
                })
            },
            handleChange(pagination, filters, sorter) {
                this.$emit('change', pagination, filters, sorter)
            },
            parseColumns() {
                if (!this.$slots.default)
                    return false;
                this.columns = []
                this.slotColumns.forEach((o, index) => {
                    let column = o.componentInstance
                    if (column) {
                        let item = {
                            align: column.align || 'left',
                            colSpan: column.colSpan,
                            dataIndex: column.prop,
                            title: column.title,
                            filterDropdown: column.filterDropdown,
                            // filterDropdownVisible: column.filterDropdownVisible, // 加上这个，导致filters不显示
                            filtered: column.filtered || false,
                            filteredValue: column.filteredValue,
                            filterIcon: column.filterIcon || false,
                            filterMultiple: column.filterMultiple || true,
                            filters: column.filters,
                            fixed: column.fixed || false,
                            key: column.dataIndex || column.id || column.title,
                            sorter: column.sorter,
                            sortOrder: column.sortOrder,
                            width: column.width,
                            customCell: column.customCell,
                            customHeaderCell: column.customHeaderCell,
                            onFilter: column.onFilter,
                            onFilterDropdownVisibleChange: column.onFilterDropdownVisibleChange,
                        };
                        if (column.$scopedSlots.default) {
                            item.customRender = (text, record, index) => {
                                return column.$scopedSlots.default({text, record, index})
                            }
                        }
                        this.columns.push(clearObj(item));
                    }
                })
            },
        },
        beforeDestroy() {
            window.removeEventListener('resize', this.getScrollY)
        }
    }
</script>

<style lang="less">
</style>