package com.hichlink.hvp.admin.modules.mgmt.web;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RequestParam;
import com.aspire.webbas.core.pagination.mybatis.pager.Page;
import com.aspire.webbas.core.web.BaseController;
import com.hichlink.hvp.common.entity.EnjoyRecord;
import com.hichlink.hvp.common.service.EnjoyRecordService;


/**
 * 
 * <b>Title：</b>EnjoyRecordController.java<br/>
 * <b>Description：</b> <br/>
 * <b>@author： </b>oceanzhuang<br/>
 * <b>@date：</b>2015-12-20 22:13:30<br/>
 * <b>Copyright (c) 2015 HichLink Tech.</b>
 * 
 */
@Controller
@RequestMapping("/enjoyRecord")
public class EnjoyRecordController extends BaseController{
	private static final Logger LOG = LoggerFactory.getLogger(EnjoyRecordController.class);
    @Autowired
    @Qualifier("enjoyRecordService")
    private EnjoyRecordService enjoyRecordService;
    
    @RequestMapping(value = "/query.ajax")
	@ResponseBody
	 public Map<String, Object> pageQuery(Page<EnjoyRecord> page) {
	    Page<EnjoyRecord> list = enjoyRecordService.pageQuery(page);
	    return super.page(list);
    }
         @RequestMapping(value = "/add.ajax", method = RequestMethod.POST)
	@ResponseBody
	public Map<String, Object> add(@ModelAttribute("enjoyRecord") EnjoyRecord data) {
    	enjoyRecordService.saveAndUpdate(data);
		return super.success("新增成功");
    }
   
    @RequestMapping(value = "/delete.ajax")
	@ResponseBody
	 public Map<String, Object> delete(Long recordId) {
    		enjoyRecordService.delete(recordId);
			return super.success("删除成功");
	  }
	 @RequestMapping(value = "/get.ajax")
	 @ResponseBody
	 public Map<String, Object> get(Long recordId) {
		 	EnjoyRecord data = enjoyRecordService.get(recordId);
			return super.success(data);
	    }
	    /**
	    *	更新的时候需额外传递updId,值跟主键值一样,被@ModelAttribute注释的方法会在此controller每个方法执行前被执行，要谨慎使用
	    */
	    @ModelAttribute("enjoyRecord")
		public void getForUpdate(@RequestParam(value = "updId",required=false) Long updId,
				Model model) {
								if (null != updId) {
									   model.addAttribute("enjoyRecord",enjoyRecordService.get(updId));
				  }else{
				  		model.addAttribute("enjoyRecord",new EnjoyRecord());
				  }
		}
	}