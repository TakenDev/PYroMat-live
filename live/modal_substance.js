

// Messing with the layout of the DataTable
//https://stackoverflow.com/questions/38602873/datatables-button-and-search-box-position

class SubstancePicker {

    // Hard code the column indexes
    static idi = 0;        // ID string
    static nami = 1;       // name
    static mwi = 2;        // molecular weight
    static coli = 3;       // collection
    static clsi = 4;       // class
    sTable;

    callback = null;

    constructor(outer_div_id, html, initialdata, callback) {
        this.$outer = $('#'+outer_div_id);
        this.$outer.addClass("modal");

        this.$inner = $("<div></div>");
        this.$inner.addClass("modal-content");
        this.$outer.append(this.$inner);

        this.callback = callback;

        this.$inner.load(html, ()=>{

            this.button_updatefilt_name = "filt_update";
            this.button_cancel_name = "selection_cancel";

            this.button_cancel = $('#'+this.button_cancel_name, this.$outer);
            this.cancel = this.cancel.bind(this);
            this.button_cancel.on("click", this.cancel);

            this.update_filter = this.update_filter.bind(this);
            $("#filt_col").on("change", this.update_filter)
            $("#filt_cls").on("change", this.update_filter)
            $("#filt_mw_min").on("change", this.update_filter)
            $("#filt_mw_max").on("change", this.update_filter)

            this.data_ready(initialdata);
        });
    }


    // SEL_UPDATE_FILTER
    //      sel_update_filter()
    // This is a wrapper function for sTable.draw(), which provides access
    // to the global sTable object.  This is the callback function to update
    // the selector table based on the filter.
    update_filter(){
        this.sTable.draw();
    }


    // SEL_FILTER
    //      sel_filter(settings, data, dataIndex)
    // The filter function is used to apply the filter settings to each row
    // It returns true when the row should be included.  The template for
    // the filter function is specified by the DataTables interface.  The
    // only argument used is data, which is an array of the row values, used
    // to apply the filter.
    //
    // When SEL_FILTER returns true, the row will be included by the filter.
    // When SEL_FILTER returns false, the row will be excluded by the
    // filter.  The SEL_FILTER is applied as a callback to the DataTables in
    // the SEL_DATA_READY function.
    filter(settings, data, dataIndex){
        let mw = data[SubstancePicker.mwi];
        let col = data[SubstancePicker.coli];
        let cls = data[SubstancePicker.clsi];

        let mw_min = parseFloat(document.getElementById('filt_mw_min').value);
        let mw_max = parseFloat(document.getElementById('filt_mw_max').value);
        let col_ = document.getElementById('filt_col').value;
        let cls_ = document.getElementById('filt_cls').value;

        return (isNaN(mw_min) || mw >= mw_min) &&
            (isNaN(mw_max) || mw <= mw_max) &&
            (col_ == '' || col == col_) &&
            (cls_ == '' || cls == cls_);
    }



    select(idstr){
        let ok = confirm("Changing the substance will clear all data. Do you want to proceed?")
        if (ok){
            if (this.callback) {
                this.callback(idstr);
            }
        } else {
            // ignore
        }
    }


    // SEL_DATA_READY
    //      sel_data_ready()
    // The SEL_DATA_READY function is the callback function for when the
    // PMGI response comes back with the available substances.  It populates
    // the rows of the selector table row-by-row.
    //
    // SEL_DATA_READY is assigned as a callback to the sTable object in the
    // SEL_INIT function.
    data_ready(data){
        let substances = data;
        // Initialize the data table
        if (this.sTable === undefined) {
            this.sTable = new DataTable('#selector_table', {});
        }


        // Loop over each of the substances
        let rowi = 0
        for (let idstr in substances){
            let subst = substances[idstr];
            // Parse the name
            if (subst.nam.length>0){
                name = subst.nam[0];
            }else{
                name = '';
            }

            let idtag = $('<a class="clickable" href="#"></a>');
            idtag.append(idstr);

            // Add the row
            // ID, name, MW, collection, class
            this.sTable.row.add([idtag[0].outerHTML, name, subst.mw.toLocaleString("en-US", {maximumFractionDigits: 2}), subst.col, subst.cls]);

            rowi += 1;
        }

        $('tbody', this.$outer).on( 'click', "a", (clicked)=>{
            this.select(clicked.currentTarget.innerHTML);
        });

        // https://datatables.net/examples/plug-ins/range_filtering.html
        // Register the filter() function for selecting rows
        // This is JQuery obfuscation magic.
        $.fn.dataTable.ext.search.push(this.filter);

        // Adjust the column sizes to match the window
        this.sTable.columns.adjust().draw()
    }

    toggle(){
        this.$outer.toggle()
    }

    hide(){
        this.$outer.hide();
    }


    cancel(){
        this.hide();
    }
}






