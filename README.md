# Check Modified Content Links Validity Action

This action should be triggered by pull_request_target event. The action checks the links in the modified content are valid or not. If there are invalid links, the output should be false, and the pull
request should be closed.


## Inputs
### `token` github user token

### no inputs required

## Outputs

### `validity`

The links in the modified content are valid or not.

## Example usage

```yaml
uses: Chen-Zidi/check-modified-contents-link-validity-action@main
```
