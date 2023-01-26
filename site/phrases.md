# List of Warning Phrases

<table>
  <thead>
  <tr>
    <th>phrase</th>
    <th>message</th>
  </tr>
  </thead>
  <tbody>
  {% for phrase in site.data.phrases %}
  <tr>
    <th>
      <ul>
        {% for label in phrase.displayLabel %}
        <li>"{{label}}"</li>
        {% endfor %}
      </ul>
    </th>
    <td>
      {{phrase.message}} <a href="{{phrase.source}}" rel="noopener noreferrer" target="_blank">source</a>
    </td>
  </tr>
  {% endfor %}
  </tbody>
</table>
