var DROPBOX_APP_KEY = '<YOUR APP KEY>';

function ColoredBox($el, record) {
	this.$square = $('.color-box', $el);
	this.$textbox = $('input', $el);
	this.record = record;
	this.update();
	this.$textbox.on('focusout', this.changed.bind(this));
}

ColoredBox.prototype.changed = function() {
	this.record.set('color', this.$textbox.val());
};

ColoredBox.prototype.update = function() {
	var color = this.record.get('color');
	this.$textbox.val(color);
	return this.$square.css('background', color);
};

$(function() {
	var client = new Dropbox.Client({ key: DROPBOX_APP_KEY });
	client.authenticate(function(error) {
		if (error) { alert('Authentication error: ' + error ); }
		client.getDatastoreManager().openDefaultDatastore(function(error, datastore) {
			var colored_boxes = [];
			var $elements = $('ul.color-boxes li');
			var table = datastore.getTable('colors');
			var records = table.query();

			$elements.each(function(i, $el) {
				var record = table.getOrInsert('record'+i, {order: i, color: '#000000'});
				colored_boxes.push(new ColoredBox($el, record));
			});

			datastore.recordsChanged.addListener(function(event) {
				event.affectedRecordsForTable('colors').forEach(function(record) {
					return colored_boxes[record.get('order')].update();
				});
			});
		});
	});
});
