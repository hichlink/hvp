var list_url = ctxPaths + '/orderInfo/selectDirectChargeProdOrder.ajax';
var grid_selector = "#p3s-grid-table";
var prodOrderList = null;
var prodOrderTable = null;

$(function() {
    p3sInitStatus();
});

function p3sInitStatus() {
    // 初始化产品订单列表
    p3sInitProdOrderList();
    // 价格修改提交按钮点击事件
    priceSettingSubmitBtnClickHandler();
}

/**
 * 初始化产品订单列表
 */
function p3sInitProdOrderList() {
    $.ajax({
        url : list_url,
        dataType : 'json',
        success : function(data, status) {
            if (data.success) {
                prodOrderList = data.data;
                p3sInitTable();
            }
        }
    });
}

function p3sInitTable() {
    prodOrderTable = $(grid_selector).dataTable({
        "iDisplayLength": 99,
        "bDeferRender":true,
        "bLengthChange":false,
        "bInfo":false,
        "bPaginage" : false,
        "bSort" : false,
        "bFilter" : false,
        "bDestroy" : true,
        "sScrollY":"",
        "aaData" : prodOrderList,
        "oLanguage" : {
            "oPaginate" : {
                "sNext" : "",
                "sPrevious" : ""
            },
            "sEmptyTable" : "没有任何产品订单",
            "sInfoEmpty" : "",
            "sLoadingRecords" : "请稍后，正在加载中...",
        },
        "aoColumns": [ {
            mData : "productName",
            bSortable: false,
            mRender : function(value, type, rowData) {
                return $.htmlspecialchars(value);
            }
        }, {
            mData : "price",
            bSortable: false,
            mRender : function(value, type, rowData) {
                return '<input attrid=' + rowData["productId"] + ' id=\"price_' + rowData["productId"] + '\" value="'+ value +'" class=\"numberFormat prodPriceInput\">';
            }
        }, {
            mData : "settlementPrice",
            bSortable: false,
            mRender : function(value, type, rowData) {
                return '<input attrid=' + rowData["productId"] + ' id=\"settlementprice_' + rowData["productId"] + '\" value="'+ value +'" class=\"numberFormat prodSettlementPriceInput\">';
            }
        }, {
            mData : "productId",
            bSortable: false,
            mRender : function(value, type, rowData) {
                var deleteHtml = '<div><button onclick=\"modifyEvent(' + rowData["productId"] + ')\" class=\"btn btn-xs btn-success\" data-rel=\"tooltip\" title=\"修改\" ><i class=\"ace-icon fa  fa-pencil bigger-120\"></i></button></div>';
                return deleteHtml;
            }
        }],
        "fnRowCallback" : rowCallback,
    });
}

function rowCallback(nRow, aData, iDisplayIndex) {
    setTimeout(function() {
        dtProdPriceChangeHandler(nRow, aData, iDisplayIndex);
        dtProdSettlementPriceChangeHandler(nRow, aData, iDisplayIndex);
    });
}

/**
 * 【结算价格】改变
 * @param nRow
 * @param aData
 * @param iDisplayIndex
 */
function dtProdPriceChangeHandler(nRow, aData, iDisplayIndex) {
    var txt = $(nRow).find(".prodPriceInput");
    updateDateSource(txt, "price");
}

/**
 * 【销售价格】改变
 * @param nRow
 * @param aData
 * @param iDisplayIndex
 */
function dtProdSettlementPriceChangeHandler(nRow, aData, iDisplayIndex) {
    var txt = $(nRow).find(".prodSettlementPriceInput");
    updateDateSource(txt, "settlementPrice");
}

/**
 * 更新价格数据
 * @param $changeInput
 * @param changeFlag
 */
function updateDateSource($changeInput, changeInputFlag) {
    $changeInput.off("change").on("change", function(e) {
        var val = $(this).val();
        var $this = $(this);
        $.each(prodOrderList, function(n, value) {
            if ($this.attr("attrid") == value.productId) {
                if (changeInputFlag == "price") {
                    if (!isNum(val)) {
                        value.price = 0;
                    } else {
                        if (val.length > 38) {
                            Q_Alert_Fail("请输入适当的结算价格");
                            return;
                        } else {
                            value.price = parseFloat(val);
                        }
                    }
                } else if (changeInputFlag == "settlementPrice") {
                    if (!isNum(val)) {
                        value.settlementPrice = 0;
                    } else {
                        value.settlementPrice = parseFloat(val);
                    }
                }
                return false;
            }
        });
        prodOrderTable.fnClearTable();
        p3sInitTable();
    });
}

/**
 * 修改 按钮点击事件
 */
function modifyEvent(productId) {
    var price = $("#price_" + productId).val();
    var settlementPrice = $("#settlementprice_" + productId).val();
    if (!isNum(price) || !isNum(settlementPrice)) {
        Q_Alert_Fail("请输入合法的价格");
        return;
    }
    // 两位小数验证
    if ((price + "").indexOf(".") != -1) {
        var reg = /^\d+\.+\d{1,2}$/;
        if (!reg.test(price)) {
            Q_Alert_Fail("最多只能有两位小数，请重新输入。");
            return;
        }
    }
    if ((settlementPrice + "").indexOf(".") != -1) {
        var reg = /^\d+\.+\d{1,2}$/;
        if (!reg.test(settlementPrice)) {
            Q_Alert_Fail("最多只能有两位小数，请重新输入。");
            return;
        }
    }
    $.ajax({
        url : ctxPaths + '/orderInfo/updateODByProdId.ajax',
        dataType : 'json',
        data: {
            productId: productId,
            price: price,
            settlementPrice: settlementPrice
        },
        success : function(data, status) {
            if (data.success) {
                Q_Alert(data.data, function() {
                    location.href = ctxPaths + '/pages/productPriceSetting.shtml';
                });
            } else {
                Q_Alert_Fail(data.message);
            }
        }
    });
};

function isNum(s) {
    var r = /^([1-9][0-9]*(\.[0-9]{1,4})?|0\.(?!0+$)[0-9]{1,4})$/;
    return r.test(s);
}

/**
 * 价格修改提交
 */
function priceSettingSubmitBtnClickHandler() {
    $("#submitButton").click(function() {
        var add_validator = $('#add-form').validate({
            submitHandler: function(form) {
                var finalProdList = prodOrderList;
                if (finalProdList == null || finalProdList.length == 0) {
                    Q_Alert_Fail("无产品订单记录，请新增订单后操作");
                    return;
                } else {
                    var successFlag = true;
                    $.each(finalProdList, function(n, value) {
                        if (!isNum(value.price) || !isNum(value.settlementPrice)) {
                            Q_Alert_Fail("请输入合法的价格");
                            successFlag = false;
                            return false;
                        }
                        // 两位小数验证
                        if ((value.price + "").indexOf(".") != -1) {
                            var reg = /^\d+\.+\d{1,2}$/;
                            if (!reg.test(value.price)) {
                                Q_Alert_Fail("最多只能有两位小数，请重新输入。");
                                successFlag = false;
                                return false;
                            }
                        }
                        if ((value.settlementPrice + "").indexOf(".") != -1) {
                            var reg = /^\d+\.+\d{1,2}$/;
                            if (!reg.test(value.settlementPrice)) {
                                Q_Alert_Fail("最多只能有两位小数，请重新输入。");
                                successFlag = false;
                                return false;
                            }
                        }
                    });
                    if (successFlag) {
                        var orderInfo = {};
                        orderInfo.orderDetailList = finalProdList;
                        $.ajax({
                            url : ctxPaths + '/orderInfo/updateODPriceAll.ajax',
                            type : "post",
                            contentType : "application/json; charset=UTF-8",
                            cache : false,
                            dataType : 'json',
                            data: JSON.stringify(orderInfo),
                            success : function(data, status) {
                                if (data.success == true) {
                                    Q_Alert('修改成功', function() {
                                        location.href = ctxPaths + '/pages/productPriceSetting.shtml';
                                    });
                                } else {
                                    Q_Alert_Fail(data.message);
                                }
                            }
                        });
                        return false;
                    }
                }
            },
        });
    });
}