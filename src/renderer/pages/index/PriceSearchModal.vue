<template>
    <div>
        <div>
            <a-input-search v-model="code" ref="inpRef" @blur="handleBlur" @search="handleSearch"/>
        </div>
        <div class="mar-top">
            <strong>条码：{{ showCode }}</strong>
        </div>
        <div>
            <div v-if="products.length === 0" class="text-danger margin-top">
                扫码时请不要将当前窗口关闭！
            </div>
            <div class="mar-top-lgg"></div>
            <div v-for="product in products" class="margin-top" style="font-size: 16px;">
                <a-divider></a-divider>
                <div>
                    名称：{{ product.name }}
                </div>
                <div>
                    定价：{{ product.price }} 元
                    <a-divider type="vertical"/>
                    折扣：{{ product.discount }}
                    <a-divider type="vertical"/>
                    折后价：<span style="font-size: 48px; color: red; font-weight: bold;">{{ product.sellPrice }}</span> 元
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "PriceSearch",
        data() {
            return {
                code: '',
                products: [],
                showCode: ''
            }
        },
        mounted() {
            this.handleFocus()
        },
        methods: {
            handleFocus() {
                this.$nextTick(_ => {
                    this.$refs['inpRef'] ? this.$refs['inpRef'].focus() : null
                })
            },
            handleBlur() {
                this.$nextTick(_ => {
                    this.handleFocus()
                })
            },
            handleSearch() {
                console.log(this.code)
                this.$db.find({code: this.code}, {}, (err, docs) => {
                    this.products = docs
                    this.showCode = this.code
                    this.code = ''
                    if (docs.length === 0) {
                        this.$message.warning('无此商品！')
                    }
                })
            }
        }
    }
</script>

<style scoped>

</style>