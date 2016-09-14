chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.debugger.attach({tabId:tab.id}, version,
      onAttach.bind(null, tab.id));
});

var version = "1.0";

function onAttach(tabId) {
  if (chrome.runtime.lastError) {
    alert(chrome.runtime.lastError.message);
    return;
  }

  chrome.debugger.onEvent.addListener(onEvent);
  chrome.debugger.sendCommand({tabId:tabId}, 'HeapProfiler.takeHeapSnapshot', {reportProgress: false}, function() {
    chrome.downloads.download({
      url: window.URL.createObjectURL(new Blob([json], {type: 'application/json'})),
      filename: new Date().toISOString().replace(/:/g,'.') + ".heapsnapshot"
    });

    chrome.debugger.detach({tabId:tabId});
  });

  var json = '';
  function onEvent(debuggeeId, message, params) {
    if (tabId == debuggeeId.tabId && message == 'HeapProfiler.addHeapSnapshotChunk' && typeof(params.chunk) !== 'undefined') {
      debugger;
      json += params.chunk;
    }
  }
}
