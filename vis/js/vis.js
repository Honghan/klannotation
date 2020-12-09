(function($){
    let _curDoc = null;
    let _curMapping = null;

    function getAvailableMappings(){
        qbb.inf.getMappings(function (ss){
            console.log("mappings:-", ss);
            let s = "mappings:";
            for (const m of ss){
                s += "<span name='" + m + "'>" + m + "</span>";
            }
            $(".mappings").html(s);

            $(".mappings span").click(function (){
                if ($(this).hasClass("selected")){
                    $(".mappings span").removeClass("selected");
                    _curMapping = null;
                }else{
                    _curMapping = $(this).attr("name");
                    $(".mappings span").addClass("selected");
                }
                getDocDetail(_curDoc);
            });
        });
    }

    function getAllDocIds(){
        qbb.inf.getDocList(function (docs){
            let s = "";
            for(let i=0; i<docs.length;i++){
                s += "<tr><td><a id='" + docs[i].replaceAll(".", "_") + "' docId='" + docs[i] + "'>" + docs[i] + "</a></td></tr>";
                if (i == 0){
                    _curDoc = docs[i];
                }
            }
            $('.docList').html("<table id='docListTab' class=\"display\"><thead><tr><th>doc ids</th></tr></thead>" + s + "</table>");
            $('.docList a').click(function (){
                getDocDetail($(this).attr('docId'));
            });
            $('#docListTab').DataTable({
                "order": [[ 0, "asc" ]]
            });
            getDocDetail(_curDoc);
        });
    }

    function processDocDetails(ss){
        $('.docContent').html(highlight(ss["anns"], ss["content"], false))
        $('mark').mouseover(function (){
            $('.ann').hide();
            $(this).find('.ann').each(function (){
                let ppos = $(this).parent().position();
                $(this).css("left", ppos.left);
                $(this).css("top", ppos.top - 36);
                $(this).show();
            });

        });
        $('mark').mouseout(function (){
            $(this).find('.ann').hide();
        })

        showByLegend();
    }

    function getDocDetail(docId){
        $('a.selected').removeClass('selected');
        $('.docContent').html('loading ' + docId + '...')
        _curDoc = docId;
        $('#' + _curDoc.replaceAll(".", "_")).addClass('selected');
        if (_curMapping === null)
            qbb.inf.getDocDetail(_curDoc, function (ss){
                processDocDetails(ss);
            });
        else
            qbb.inf.getDocDetailMapping(_curDoc, _curMapping, function (ss){
                processDocDetails(ss);
            });
    }

    function formatAnnotation(ann, index){
        return {
            "index": index,
            "term": "",
            "s": ann['start'],
            "e": ann['end'],
            "t": ann.sty,
            "label": ann.pref,
            "negation": isNegation(ann),
            "experiencer": ann.experiencer,
            "temporality": ann.temporality,
            "hypothetical": isHypothetical(ann),
            "abbrev": isAbbrev(ann),
            "category": "umls"
        }
    }

    function isAbbrev(ann){
        if (!ann['ruled_by'])
            return "";
        if (ann.ruled_by.includes("s_abbr.json")){
            return "abbrev";
        }else
            return "";
    }

    function isNegation(ann){
        if (!ann['ruled_by'])
            return "";
        if (ann.negation === "Negated" || ann.ruled_by.includes("negation_filters.json"))
            return "Negated";
        else
            return "Affirmed";
    }

    function isHypothetical(ann){
        if (!ann['ruled_by'])
            return "";
        if (ann.temporality === "hypothetical" || ann.ruled_by.includes("hypothetical_filters.json"))
            return "hypo";
        else
            return "";
    }

    function formatPhenotypeAnn(ann, index){
        return {
            "index": index,
            "term": "",
            "s": ann['start'],
            "e": ann['end'],
            "t": ann.minor_type,
            "label": ann.str,
            "negation": isNegation(ann),
            "experiencer": ann.experiencer,
            "temporality": ann.temporality,
            "hypothetical": isHypothetical(ann),
            "abbrev": isAbbrev(ann),
            "category": "customised"
        }
    }

    /**
     * sort and filter out overlapped annotations (keep the max length annotations)
     * @param anns
     * @returns {[]} return the sorted and deduplicated annotations
     */
    function sortAndFilterAnnotations(anns){
        let sorted_anns = anns.sort(function(a, b){
            return a["s"] - b["s"];
        });
        let overlaps = [];
        for(let i=0;i<sorted_anns.length;i++){
            let a = sorted_anns[i];
            let overlap = [];
            for(let j=i+1;j<sorted_anns.length;j++){
                let b = sorted_anns[j];
                if (a.e > b.s){
                    if (overlap.length === 0)
                        overlap.push(a);
                    overlap.push(b);
                }else
                    break;
            }
            if (overlap.length > 0)
                overlaps.push(overlap);
        }
        let anns2remove = [];
        for(let i=0;i<overlaps.length;i++){
            let sortedOverlap = overlaps[i].sort(function (a, b){
                return parseInt(a.e) - parseInt(a.s) - parseInt(b.e) + parseInt(b.s);
            });
            for(let j=0; j< sortedOverlap.length - 1;j++){
                anns2remove.push(sortedOverlap[j].index);
            }
        }

        console.log("annotations to remove: ", anns2remove);
        let newAnns = [];
        for(let i=0;i<anns.length;i++){
            if (!(anns2remove.includes(anns[i].index)))
                newAnns.push(anns[i]);
        }
        console.log("removed: ", anns.length - newAnns.length);
        return newAnns;
    }

    function highlight(ann_ret, text, snippet) {
        let idx;
        let hos = [];
        let anns = ann_ret['annotations'];
        console.log(ann_ret);
        for (idx in ann_ret['annotations']){
            hos.push(formatAnnotation(anns[idx], hos.length));
        }
        for (idx in ann_ret['phenotypes']){
            hos.push(formatPhenotypeAnn(ann_ret['phenotypes'][idx], hos.length));
        }
        hos = sortAndFilterAnnotations(hos);

        const moreTextLen = 20;
        let new_str = "";
        if (hos.length > 0){
            let prev_pos = snippet ? (hos[0]['s'] > moreTextLen ? hos[0]['s'] - moreTextLen : hos[0]['s']) : 0;
            if (prev_pos > 0)
                new_str += "...";
            for (let idx in hos){
                const ann = hos[idx];
                const cls = ['default', ann.category, ann.negation, ann.temporality,
                    ann.hypothetical, ann.abbrev].join(" ");

                new_str += text.substring(prev_pos, ann["s"]) +
                    "<mark class='" + cls + "'><span title='" +
                    ann["t"] + "' class=\"ann\">" + ann["label"] + " | " +
                    ann["t"] + "</span>" + text.substring(ann["s"], ann["e"]) + "</mark>";
                prev_pos = ann["e"];
                if (snippet)
                    break;
            }
            const endPos = snippet ? Math.min(parseInt(prev_pos) + moreTextLen, text.length) : text.length;
            new_str += text.substring(prev_pos, endPos);
            if (endPos < text.length)
                new_str += "...";
        }else{
            new_str = snippet ? text.substring(0, Math.min(text.length, moreTextLen)) + "...": text;
        }
        return new_str;
    }

    function toggleAnn(){
        $('.legend mark').click(function (){
            if ($(this).hasClass("selected")){
                $(this).removeClass("selected");
                // $('.docContent .' + $(this).attr('class')).addClass("clear");
            }else{
                // $('.docContent .' + $(this).attr('class')).removeClass("clear");
                $(this).addClass("selected");
            }
            showByLegend();
        });
    }

    function showByLegend(){
        $('.legend mark').each(function (){
            const cls = $(this).attr('class').replaceAll("selected", "");
            if ($(this).hasClass("selected")){
                $('.docContent .' +  cls).removeClass("clear");
            }else{
                $('.docContent .' + cls).addClass("clear");
            }
        });
    }

    $(document).ready(function(){
        getAvailableMappings();
        getAllDocIds();
        toggleAnn();
    })

})(this.jQuery)
