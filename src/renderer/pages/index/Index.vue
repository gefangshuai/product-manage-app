<template>
    <admin-layout>
        <div slot="header" class="flex-space-between">
            <h3>
                商品列表 （共 {{ totalCount }} 条记录）
            </h3>
            <div>
                <a-input-search v-model="keyword" style="width: 300px;" placeholder="搜索名称"
                                @search="handleSearch"/>
                <a-button type="primary" @click="priceSearch">价格查询</a-button>
                <a-upload name="file"
                          :show-upload-list="false"
                          :multiple="false"
                          :before-upload="beforeUpload">
                    <a-button :loading="loading"
                              icon="upload">批量导入
                    </a-button>
                </a-upload>
                <a-button @click="batchRemove">批量删除</a-button>
                <a-button @click="removeAll">全部删除</a-button>
                <a-button @click="openDev">调试</a-button>
            </div>
        </div>
        <s-table
            :config="{dataSource: data, rowKey: '_id', pagination: false, rowSelection: { selectedRowKeys: selectedRowKeys, onChange: onSelectChange }}"
            :offset-height="60"
            auto-height>
            <s-table-column title="#" :width="80">
                <template slot-scope="{index}">
                    {{ (currentPage - 1) * 10 + index + 1 }}
                </template>
            </s-table-column>
            <s-table-column title="自编号" prop="key" :width="200"></s-table-column>
            <s-table-column title="条码" prop="code" :width="200"></s-table-column>
            <s-table-column title="书籍名称" prop="name">
                <template slot-scope="{text}">
                    <span style="font-weight: bold">{{ text }}</span>
                </template>
            </s-table-column>
            <s-table-column title="定价（元）" prop="price" :width="120"></s-table-column>
            <s-table-column title="零售折扣" prop="discount" :width="100"></s-table-column>
            <s-table-column title="折后价（元）" prop="sellPrice" :width="120">
                <template slot-scope="{text}">
                    <span style="font-weight: bold;">{{ text }}</span>
                </template>
            </s-table-column>
        </s-table>
        <div slot="footer">
            <a-pagination v-model="currentPage" :total="totalCount" @change="handlePageChange"/>
        </div>
        <a-modal v-model="priceSearchVisible"
                 :width="800"
                 :mask-closable="false"
                 :footer="null"
                 title="扫描商品，查询价格">
            <price-search v-if="priceSearchVisible"/>
        </a-modal>
    </admin-layout>
</template>

<script>
    import AdminLayout from "../../components/layout/AdminLayout";
    import XLSX from 'xlsx'
    import STable from "../../components/table/STable";
    import STableColumn from "../../components/table/STableColumn";
    import PriceSearch from "./PriceSearchModal";
    import {remote} from 'electron'

    const columns = [
        {title: '自编号', dataIndex: 'key', key: 'key', width: 200},
        {title: '条码', dataIndex: 'code', key: 'code', width: 200},
        {title: '书籍名称', dataIndex: 'name', key: 'name'},
        {title: '定价', dataIndex: 'price', key: 'price', width: 100},
        {title: '零售折扣', dataIndex: 'discount', key: 'discount', width: 100},
        {title: '折后价', dataIndex: 'sellPrice', key: 'sellPrice', width: 100},
    ];

    export default {
        name: "Index",
        components: {PriceSearch, STableColumn, STable, AdminLayout},
        data() {
            return {
                currentPage: 1,
                data: [],
                columns,
                loading: false,
                scrollY: 0,
                currentCode: '',
                priceSearchVisible: false,
                totalCount: 0,
                keyword: '',
                selectedRowKeys: []
            };
        },
        created() {
            this.loadData()
        },
        mounted() {
        },
        methods: {
            loadData() {
                let query = {
                    name: {
                        $regex: new RegExp(`${this.keyword}`)
                    }
                }
                console.log('query', query)
                this.$db.find(query).sort({key: 1}).skip((this.currentPage - 1) * 10).limit(10).exec((err, docs) => {
                    this.data = docs
                })
                this.$db.count(query).exec((err, count) => {
                    this.totalCount = count
                })
            },
            findByKey(key) {
                return new Promise((resolve, reject) => {
                    this.$db.findOne({key: key}).exec((err, doc) => {
                        if (err) {
                            reject(err)
                        } else {
                            resolve(doc)
                        }
                    })
                })
            },
            async beforeUpload(file) {
                try {
                    this.loading = true
                    this.$nextTick(_ => {
                        let workbook = XLSX.readFile(file.path);
                        let sheetName = workbook.SheetNames[0]
                        let sheet = workbook.Sheets[sheetName]
                        let data = XLSX.utils.sheet_to_json(sheet)
                        let index = 1
                        data.forEach(async (item) => {
                            let product = {
                                key: item['自编号'],
                                code: item['条码'],
                                name: item['书籍名称'],
                                price: item['定价'],
                                discount: item['零售折扣'],
                                sellPrice: item['折后价']
                            }
                            console.log(index, data.length, product)
                            const finish = () => {
                                index += 1
                                if (index === data.length) {
                                    setTimeout(_ => {
                                        alert('导入成功！')
                                        location.reload()
                                    }, 1000)
                                }
                            }
                            this.findByKey(product.key).then(doc => {
                                if (doc) {
                                    this.updateProduct(doc._id, product).then(finish)
                                } else {
                                    this.saveProduct(product).then(finish)
                                }
                            })
                        })
                    })
                } catch (e) {
                    this.$nextTick(_ => {
                        this.$message.error('导入失败，请重试！')
                        this.loading = false
                    })
                }
                return false;
            },
            updateProduct(id, project) {
                console.log('数据重复，更新：', project)
                return new Promise(((resolve, reject) => {
                    this.$db.update({_id: id}, project, {}, (err, numReplaced) => {
                        if (err) {
                            reject(err)
                        } else {
                            resolve(numReplaced)
                        }
                    })
                }))
            },
            saveProduct(product) {
                return new Promise((resolve, reject) => {
                    this.$db.insert(product, (err, doc) => {
                        if (err) {
                            reject(err)
                        } else {
                            resolve(doc)
                        }
                    })
                })
            },

            priceSearch() {
                this.priceSearchVisible = true
            },
            handlePageChange(page) {
                this.currentPage = page
                this.loadData()
            },
            handleSearch() {
                this.loadData()
            },
            openDev() {
                remote.getCurrentWebContents().openDevTools()
            },
            onSelectChange(selectedRowKeys) {
                this.selectedRowKeys = selectedRowKeys
            },
            batchRemove() {
                if (this.selectedRowKeys.length > 0) {
                    if (confirm(`确定要删除当前所选 ${this.selectedRowKeys.length} 个商品吗？`)) {
                        this.$db.remove({_id: {$in: this.selectedRowKeys}}, {multi: true}, (err, num) => {
                            this.selectedRowKeys = []
                            this.loadData()
                            this.$message.success('删除成功！')
                        })
                    }
                } else {
                    this.$message.warning('请勾选要删除的商品！')
                }
            },
            removeAll() {
                if (confirm('确定要删除全部商品吗？')) {
                    this.$db.remove({}, {multi: true}, (err, num) => {
                        this.selectedRowKeys = []
                        this.loadData()
                        this.$message.success('删除成功！')
                    })
                }
            }
        },
        beforeDestroy() {
        }
    }
</script>

<style scoped>

</style>